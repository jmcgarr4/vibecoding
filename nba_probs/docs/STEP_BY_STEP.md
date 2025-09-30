# Step-by-step plan for building the NBA win-probability tracker

This guide walks you from an empty project to a pipeline that compares your NBA
win-probability model with real-time Polymarket odds. Treat it as a living
checklist—update it as you learn more, make architectural decisions, and run
experiments.

## 0. Prerequisites

- Install Python 3.10 or later.
- Create and activate a virtual environment.
- From the `nba_probs/` directory, install the package in editable mode:

  ```bash
  pip install -e .[notebooks]
  ```

- Configure a `.env` file (see `docs/environment.example`) with API keys when you
  start integrating external services.

## 1. Explore NBA play-by-play data

1. Skim the [`nba_api`](https://github.com/swar/nba_api) documentation.
2. Use the `PlayByPlayV3` endpoint to download a single game.
3. Convert the event stream into one-minute buckets:
   - Track the game clock and quarter to compute elapsed seconds.
   - Keep running score by team.
   - Record which team eventually won (target variable).
4. Save the processed data to `data/raw/` as Parquet files (git-ignored).

**Deliverable:** a notebook in `notebooks/01_download_single_game.ipynb`
showing the pipeline for a single game, plus a helper function promoted to
`src/nba_probs/data_pipeline.py` once it works.

## 2. Automate historical data collection

1. Build a catalog of game IDs for the 2023-2024 and 2024-2025 seasons using
   `LeagueGameFinder` or schedule endpoints.
2. Iterate over the game list, downloading play-by-play data and materializing
   one-minute summaries to `data/processed/`.
3. Include logging, retry handling, and rate-limit-friendly sleeps.

**Deliverable:** a command-line script (e.g., `python -m nba_probs.cli.collect`)
that populates your local dataset.

> **Note:** The 2024-2025 NBA season schedule is not yet finalized. Until it is,
> work with the latest completed season to develop and validate your pipeline.

## 3. Baseline win-probability model

1. Aggregate the minute-level summaries into a DataFrame with the following
   columns:
   - `game_id`
   - `minute` (0 through 47)
   - `score_margin` (home score minus away score)
   - `seconds_remaining`
   - `home_win` (binary target)
2. Split into train/validation sets by season to avoid leakage.
3. Train a logistic-regression model using scikit-learn.
4. Evaluate calibration (Brier score, reliability plots) and overall accuracy.
5. Save the trained model to `data/models/` using joblib.

**Deliverable:** a notebook `notebooks/02_train_baseline_model.ipynb` and helper
functions in `src/nba_probs/modeling.py`.

## 4. Integrate Polymarket odds

1. Read [Polymarket's API documentation](https://docs.polymarket.com/).
2. Implement the client in `src/nba_probs/polymarket.py` to:
   - List NBA moneyline markets.
   - Fetch live orderbook data for a market.
   - Convert prices to implied probabilities.
3. Store snapshots in `data/polymarket/`.

**Deliverable:** a script `python -m nba_probs.cli.polymarket_snapshot --game-id
<id>` that records the latest market odds.

## 5. Compare model vs. market

1. Align timestamps between your in-game win-probability predictions and the
   Polymarket snapshots.
2. Compute metrics such as:
   - Absolute probability difference.
   - Z-score using model calibration error.
   - Opportunity signals (e.g., threshold for actionable discrepancies).
3. Visualize the time series of both probabilities for selected games.

**Deliverable:** `notebooks/03_compare_model_vs_market.ipynb` demonstrating the
comparison and surfacing the largest divergences.

## 6. Towards real-time execution

1. Set up a lightweight scheduler (e.g., APScheduler or cron) to call both data
   sources during live games.
2. Cache partial game state so you can update predictions incrementally.
3. Implement alerting (Slack, email, console) when discrepancies exceed your
   threshold.

**Deliverable:** a prototype monitoring script in `src/nba_probs/monitoring.py`.

## 7. Production hardening (future work)

- Write automated tests for key transformations.
- Add structured logging and observability.
- Containerize the app for deployment (Docker).
- Track model versions and data lineage (e.g., MLflow, DVC).

Keep checking off items as you go. Update this guide with lessons learned and
refinements to help future you (or collaborators) understand the project
history.
