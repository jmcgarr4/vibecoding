import argparse
import json
import subprocess
import sys
from types import SimpleNamespace

import pytest

pd = pytest.importorskip("pandas")

from nba_probs.cli import collect as collect_cli
from nba_probs.cli import polymarket_snapshot as snapshot_cli
from nba_probs.polymarket import Orderbook


@pytest.mark.cli
def test_collect_help_runs():
    result = subprocess.run(
        [sys.executable, "-m", "nba_probs.cli.collect", "--help"],
        check=True,
        capture_output=True,
        text=True,
    )
    assert "Download NBA games" in result.stdout


@pytest.mark.cli
def test_polymarket_snapshot_help_runs():
    result = subprocess.run(
        [sys.executable, "-m", "nba_probs.cli.polymarket_snapshot", "--help"],
        check=True,
        capture_output=True,
        text=True,
    )
    assert "Polymarket orderbook snapshot" in result.stdout


@pytest.mark.cli
def test_collect_main_writes_parquet(tmp_path, monkeypatch, dummy_settings):
    dataset = pd.DataFrame(
        {
            "game_id": ["001"],
            "minute_index": [0],
            "period": [1],
            "seconds_remaining": [720],
            "home_team_score": [10],
            "away_team_score": [8],
            "home_team_id": [100],
            "away_team_id": [200],
            "home_win": [1],
            "score_margin": [2],
        }
    )

    monkeypatch.setattr(collect_cli, "batch_fetch", lambda *args, **kwargs: dataset)
    monkeypatch.setattr(collect_cli, "get_settings", lambda: dummy_settings)

    output_path = tmp_path / "dataset.parquet"
    args = argparse.Namespace(game_ids=["001"], output=output_path, no_progress=True)

    collect_cli.main(args)

    assert output_path.exists()
    assert output_path.stat().st_size > 0


@pytest.mark.cli
def test_polymarket_snapshot_appends_json(tmp_path, monkeypatch, dummy_settings):
    monkeypatch.setattr(snapshot_cli, "get_settings", lambda: dummy_settings)

    def fake_client():
        return SimpleNamespace(
            fetch_orderbook=lambda market_id: Orderbook(
                market_id=market_id,
                yes_price=0.6,
                no_price=0.4,
            )
        )

    monkeypatch.setattr(snapshot_cli, "PolymarketClient", fake_client)

    output_path = tmp_path / "snapshot.json"
    args = argparse.Namespace(market_id="abc", output=output_path)

    snapshot_cli.main(args)
    snapshot_cli.main(args)

    payload = json.loads(output_path.read_text())
    assert len(payload) == 2
    assert payload[0]["market_id"] == "abc"
    assert 0 <= payload[0]["implied_yes_probability"] <= 1
