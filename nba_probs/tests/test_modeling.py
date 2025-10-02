import pytest

np = pytest.importorskip("numpy")
pd = pytest.importorskip("pandas")
pytest.importorskip("sklearn")
pytest.importorskip("joblib")

from nba_probs.modeling import load_model, predict_win_probability, train_baseline_model
from sklearn.linear_model import LogisticRegression


def sample_training_data() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "score_margin": [-12, -8, -3, 0, 2, 5, 9, 11, 7, -5, 4, -2],
            "seconds_remaining": [30, 120, 240, 360, 420, 480, 540, 600, 660, 720, 780, 840],
            "home_win": [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0],
        }
    )


def test_train_baseline_model_returns_metrics(tmp_path):
    data = sample_training_data()
    artifacts = train_baseline_model(data, random_state=0)

    assert isinstance(artifacts.model, LogisticRegression)
    assert artifacts.train_rows > 0
    assert 0 <= artifacts.brier <= 1
    assert 0 <= artifacts.roc_auc <= 1

    model_path = tmp_path / "model.joblib"
    artifacts.save(model_path)

    loaded = load_model(model_path)
    assert np.isclose(loaded.brier, artifacts.brier)
    assert np.isclose(loaded.roc_auc, artifacts.roc_auc)


def test_predict_win_probability_in_range():
    data = sample_training_data()
    artifacts = train_baseline_model(data, random_state=0)

    prob = predict_win_probability(
        artifacts.model,
        score_margin=5,
        seconds_remaining=300,
    )

    assert 0.0 <= prob <= 1.0
