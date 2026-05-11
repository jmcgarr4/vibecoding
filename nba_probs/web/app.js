/* NBA Live Probabilities — app.js
 *
 * Fetches today's scoreboard from the public NBA CDN and renders live game
 * cards with win-probability estimates computed from score margin and time.
 */

const NBA_SCOREBOARD_URL =
  "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json";

// Auto-refresh interval while live games are on (ms)
const LIVE_REFRESH_INTERVAL = 30_000;

let refreshTimer = null;

// ── Win-probability model ────────────────────────────────────────────────────

/**
 * Logistic win-probability estimate for the home team.
 *
 * Uses the interaction between score margin and time remaining:
 *   logit(p) = margin × 3.5 / √(secondsRemaining + 1)
 *
 * Calibrated so that:
 *   • 0 margin at any time → 50 %
 *   • +10 with 2 min left  → ~97 %
 *   • +10 at tip-off       → ~61 %
 *
 * @param {number} margin           home score minus away score
 * @param {number} secondsRemaining total seconds left in regulation
 * @returns {number} probability in [0, 1]
 */
function winProb(margin, secondsRemaining) {
  if (secondsRemaining <= 0) {
    if (margin > 0) return 1;
    if (margin < 0) return 0;
    return 0.5;
  }
  const logit = (margin * 3.5) / Math.sqrt(secondsRemaining + 1);
  return 1 / (1 + Math.exp(-logit));
}

// ── Clock parsing ────────────────────────────────────────────────────────────

/** Parse NBA ISO-style game clock "PT05M30.00S" → seconds (330). */
function parseGameClock(clockStr) {
  if (!clockStr) return 0;
  const m = clockStr.match(/PT(\d+)M(\d+(?:\.\d+)?)S/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 60 + parseFloat(m[2]);
}

/**
 * Total regulation seconds remaining in the game.
 * Overtime is clamped to 0 to avoid negative values.
 */
function secondsRemaining(period, clockStr) {
  const periodSecs = parseGameClock(clockStr);
  const periodsLeft = Math.max(0, 4 - period);
  return periodSecs + periodsLeft * 12 * 60;
}

// ── Time formatting ──────────────────────────────────────────────────────────

/** Format a UTC date string as local tip-off time (e.g. "7:30 PM"). */
function formatTipOff(utcStr) {
  if (!utcStr) return "TBD";
  try {
    return new Date(utcStr).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "TBD";
  }
}

/** Format today's date as "Tuesday · March 24" */
function formatToday() {
  return new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Elapsed time string for the "last updated" footer line. */
function formatUpdatedAt(date) {
  return `Updated ${date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  })}`;
}

// ── DOM helpers ──────────────────────────────────────────────────────────────

function show(el) { el.hidden = false; }
function hide(el) { el.hidden = true; }

function $(id) { return document.getElementById(id); }

// ── Card rendering ───────────────────────────────────────────────────────────

/** gameStatus: 1 = upcoming, 2 = live, 3 = final */
const STATUS_UPCOMING = 1;
const STATUS_LIVE = 2;
const STATUS_FINAL = 3;

function buildGameCard(game) {
  const { gameStatus, gameStatusText, period, gameClock, gameTimeUTC } = game;
  const home = game.homeTeam;
  const away = game.awayTeam;

  const isLive = gameStatus === STATUS_LIVE;
  const isFinal = gameStatus === STATUS_FINAL;
  const isUpcoming = gameStatus === STATUS_UPCOMING;

  // Win probability (only meaningful for live games)
  let homePct = 50;
  if (isLive) {
    const secs = secondsRemaining(period, gameClock);
    const margin = (home.score ?? 0) - (away.score ?? 0);
    homePct = Math.round(winProb(margin, secs) * 100);
  } else if (isFinal) {
    homePct = (home.score ?? 0) > (away.score ?? 0) ? 100 : 0;
    if ((home.score ?? 0) === (away.score ?? 0)) homePct = 50;
  }
  const awayPct = 100 - homePct;

  // Status label text
  let statusHtml;
  if (isLive) {
    statusHtml = `<span class="status-label live">${gameStatusText ?? "LIVE"}</span>`;
  } else if (isFinal) {
    statusHtml = `<span class="status-label">FINAL</span>`;
  } else {
    statusHtml = `<span class="status-label">UPCOMING</span>`;
  }

  // Score or tip-off time
  let scoreHtml;
  if (isUpcoming) {
    scoreHtml = `<div class="tipoff-time">${formatTipOff(gameTimeUTC)}</div>`;
  } else {
    scoreHtml = `
      <div class="score-display">
        <span class="score-home">${home.score ?? 0}</span>
        <span class="score-sep">–</span>
        <span class="score-away">${away.score ?? 0}</span>
      </div>`;
  }

  // Probability bar (hidden for upcoming)
  let probHtml = "";
  if (!isUpcoming) {
    probHtml = `
      <div class="prob-section">
        <div class="prob-header">
          <span>${home.teamTricode} win %</span>
          <span>${away.teamTricode} win %</span>
        </div>
        <div class="prob-bar-track">
          <div class="prob-bar-fill" style="width:${homePct}%"></div>
        </div>
        <div class="prob-values">
          <span class="prob-home">${homePct}%</span>
          <span class="prob-away">${awayPct}%</span>
        </div>
      </div>`;
  }

  const card = document.createElement("div");
  card.className = `game-card${isLive ? " is-live" : ""}`;
  card.innerHTML = `
    <div class="game-status-bar">
      ${statusHtml}
      <span class="series-info">${home.wins ?? ""}–${home.losses ?? ""} vs ${away.wins ?? ""}–${away.losses ?? ""}</span>
    </div>
    <div class="matchup">
      <div class="team home">
        <span class="team-tricode">${home.teamTricode}</span>
        <span class="team-name">${home.teamCity} ${home.teamName}</span>
      </div>
      <div class="score-block">
        ${scoreHtml}
      </div>
      <div class="team away">
        <span class="team-tricode">${away.teamTricode}</span>
        <span class="team-name">${away.teamCity} ${away.teamName}</span>
      </div>
    </div>
    ${probHtml}
  `;
  return card;
}

// ── Data fetching & rendering ────────────────────────────────────────────────

async function loadGames() {
  const container = $("gamesContainer");
  const loadingState = $("loadingState");
  const emptyState = $("emptyState");
  const errorState = $("errorState");
  const liveCount = $("liveCount");
  const dateLabel = $("dateLabel");
  const lastUpdated = $("lastUpdated");
  const refreshBtn = $("refreshBtn");

  refreshBtn.classList.add("spinning");
  hide(emptyState);
  hide(errorState);

  try {
    const res = await fetch(NBA_SCOREBOARD_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const games = json?.scoreboard?.games ?? [];

    hide(loadingState);
    refreshBtn.classList.remove("spinning");

    dateLabel.textContent = formatToday();
    lastUpdated.textContent = formatUpdatedAt(new Date());

    container.innerHTML = "";

    if (games.length === 0) {
      show(emptyState);
      stopAutoRefresh();
      return;
    }

    const liveGames = games.filter((g) => g.gameStatus === STATUS_LIVE);

    if (liveGames.length > 0) {
      show(liveCount);
      liveCount.textContent = `${liveGames.length} game${liveGames.length > 1 ? "s" : ""} live`;
      scheduleAutoRefresh();
    } else {
      hide(liveCount);
      stopAutoRefresh();
    }

    // Sort: live first, then upcoming, then final
    const sorted = [...games].sort((a, b) => {
      const order = { 2: 0, 1: 1, 3: 2 };
      return (order[a.gameStatus] ?? 3) - (order[b.gameStatus] ?? 3);
    });

    sorted.forEach((game) => container.appendChild(buildGameCard(game)));
  } catch (err) {
    console.error("Failed to load NBA games:", err);
    hide(loadingState);
    refreshBtn.classList.remove("spinning");
    show(errorState);
    stopAutoRefresh();
  }
}

// ── Auto-refresh ─────────────────────────────────────────────────────────────

function scheduleAutoRefresh() {
  if (refreshTimer) return; // already running
  refreshTimer = setInterval(loadGames, LIVE_REFRESH_INTERVAL);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.getElementById("refreshBtn").addEventListener("click", () => {
  stopAutoRefresh();
  loadGames();
});

// Reload when the tab becomes visible again after being backgrounded
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    loadGames();
  }
});

loadGames();
