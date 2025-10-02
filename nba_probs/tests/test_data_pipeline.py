import pytest

pd = pytest.importorskip("pandas")

from nba_probs.data_pipeline import summarize_game_by_minute


def _sample_play_by_play() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "gameId": "001",
                "periodNumber": 1,
                "clock": "PT11M59.00S",
                "homeScore": 0,
                "awayScore": 0,
                "homeTeamId": 100,
                "visitorTeamId": 200,
                "gameDate": "2024-10-01",
            },
            {
                "gameId": "001",
                "periodNumber": 1,
                "clock": "PT11M00.00S",
                "homeScore": 3,
                "awayScore": 0,
                "homeTeamId": 100,
                "visitorTeamId": 200,
                "gameDate": "2024-10-01",
            },
            {
                "gameId": "001",
                "periodNumber": 1,
                "clock": "PT10M45.00S",
                "homeScore": 3,
                "awayScore": 2,
                "homeTeamId": 100,
                "visitorTeamId": 200,
                "gameDate": "2024-10-01",
            },
            {
                "gameId": "001",
                "periodNumber": 4,
                "clock": "PT00M00.00S",
                "homeScore": 102,
                "awayScore": 95,
                "homeTeamId": 100,
                "visitorTeamId": 200,
                "gameDate": "2024-10-01",
            },
        ]
    )


def test_summarize_game_by_minute_produces_expected_columns():
    plays = _sample_play_by_play()
    summary = summarize_game_by_minute(plays)

    assert not summary.empty
    assert {
        "game_id",
        "minute_index",
        "period",
        "seconds_remaining",
        "home_team_score",
        "away_team_score",
        "home_team_id",
        "away_team_id",
        "home_win",
        "score_margin",
    } <= set(summary.columns)

    assert summary["home_win"].iloc[0] == 1
    assert summary["score_margin"].iloc[0] == summary["home_team_score"].iloc[0] - summary["away_team_score"].iloc[0]


def test_summarize_game_by_minute_handles_empty_input():
    empty = pd.DataFrame(columns=[
        "gameId",
        "periodNumber",
        "clock",
        "homeScore",
        "awayScore",
        "homeTeamId",
        "visitorTeamId",
    ])

    with pytest.raises(ValueError):
        summarize_game_by_minute(empty)


def test_summarize_game_by_minute_column_types():
    from pandas.api.types import is_integer_dtype, is_numeric_dtype

    summary = summarize_game_by_minute(_sample_play_by_play())

    assert is_integer_dtype(summary["seconds_remaining"])
    assert is_numeric_dtype(summary["score_margin"])
    assert is_integer_dtype(summary["home_win"])
