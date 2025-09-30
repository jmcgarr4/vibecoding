"""Utilities for collecting and transforming NBA game data."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Iterable, List, Optional

import pandas as pd
from nba_api.stats.endpoints import playbyplayv3
from tqdm import tqdm

from .config import get_settings


@dataclass
class GameMinute:
    """Representation of a single minute of game play."""

    game_id: str
    minute_index: int
    period: int
    seconds_remaining: int
    home_team_score: int
    away_team_score: int
    home_team_id: int
    away_team_id: int
    home_win: Optional[int]
    game_date: Optional[datetime]

    @property
    def score_margin(self) -> int:
        return self.home_team_score - self.away_team_score


def fetch_play_by_play(game_id: str) -> pd.DataFrame:
    """Fetch raw play-by-play data for a given NBA game ID."""

    settings = get_settings()
    headers = {}
    if settings.polymarket_api_key:  # not needed but placeholder for proxies
        headers["X-API-Key"] = settings.polymarket_api_key

    response = playbyplayv3.PlayByPlayV3(game_id=game_id, headers=headers)
    data = response.get_normalized_dict()
    plays = pd.DataFrame(data["playByPlay"])
    plays["gameId"] = game_id
    return plays


def summarize_game_by_minute(plays: pd.DataFrame) -> pd.DataFrame:
    """Convert raw play-by-play events into one-minute summaries."""

    if plays.empty:
        raise ValueError("Expected play-by-play events, received empty DataFrame")

    plays = plays.copy()
    plays["periodNumber"] = plays["periodNumber"].astype(int)
    plays["clock"] = pd.to_timedelta(plays["clock"])

    periods = plays.groupby("periodNumber")

    minutes: List[GameMinute] = []

    for period, group in periods:
        group = group.sort_values("clock", ascending=False)
        game_clock = 12 * 60 if period <= 4 else 5 * 60

        home_score = 0
        away_score = 0

        for _, row in group.iterrows():
            home_score = int(row["homeScore"])
            away_score = int(row["awayScore"])
            elapsed = game_clock - int(row["clock"].total_seconds())
            minute_index = elapsed // 60

            minute = GameMinute(
                game_id=row["gameId"],
                minute_index=int(minute_index + (period - 1) * 12),
                period=int(period),
                seconds_remaining=int(row["clock"].total_seconds() + (4 - period) * 12 * 60 if period <= 4 else row["clock"].total_seconds()),
                home_team_score=home_score,
                away_team_score=away_score,
                home_team_id=int(row["homeTeamId"]),
                away_team_id=int(row["visitorTeamId"]),
                home_win=None,
                game_date=pd.to_datetime(row.get("gameDate")) if "gameDate" in row else None,
            )
            minutes.append(minute)

    df = pd.DataFrame([m.__dict__ for m in minutes]).drop_duplicates(subset=["game_id", "minute_index"], keep="last")

    last_row = plays.iloc[-1]
    home_win = int(last_row["homeScore"] > last_row["awayScore"])
    df["home_win"] = home_win
    df["score_margin"] = df["home_team_score"] - df["away_team_score"]
    df.sort_values("minute_index", inplace=True)
    return df


def batch_fetch(game_ids: Iterable[str], show_progress: bool = True) -> pd.DataFrame:
    """Download and summarize multiple games."""

    records: List[pd.DataFrame] = []
    iterator: Iterable[str] = tqdm(game_ids, desc="Downloading games") if show_progress else game_ids

    for game_id in iterator:
        try:
            plays = fetch_play_by_play(game_id)
            minutes = summarize_game_by_minute(plays)
            records.append(minutes)
        except Exception as exc:  # pragma: no cover - debug logging placeholder
            print(f"Failed to process game {game_id}: {exc}")
            continue

    if not records:
        raise RuntimeError("No games were successfully processed.")

    return pd.concat(records, ignore_index=True)


__all__ = [
    "GameMinute",
    "fetch_play_by_play",
    "summarize_game_by_minute",
    "batch_fetch",
]
