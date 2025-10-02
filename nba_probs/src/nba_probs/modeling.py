"""Model training and inference utilities for win probability estimation."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Tuple, TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover - imported for type checking only
    import pandas as pd  # type: ignore import-not-found  # noqa: F401
    from sklearn.linear_model import LogisticRegression  # type: ignore import-not-found

from .config import get_settings


@dataclass
class ModelArtifacts:
    """Container for artifacts produced during training."""

    model: LogisticRegression
    features: Tuple[str, ...]
    brier: float
    roc_auc: float
    train_rows: int
    test_rows: int

    def save(self, path: Path) -> None:
        import joblib  # type: ignore import-not-found

        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({
            "model": self.model,
            "features": self.features,
            "brier": self.brier,
            "roc_auc": self.roc_auc,
            "train_rows": self.train_rows,
            "test_rows": self.test_rows,
        }, path)


FEATURES = ("score_margin", "seconds_remaining")
TARGET = "home_win"


def train_baseline_model(
    data: "pd.DataFrame",
    *,
    random_state: int = 42,
) -> ModelArtifacts:
    """Train a baseline logistic regression model on the provided dataset."""

    from sklearn.linear_model import LogisticRegression  # type: ignore import-not-found
    from sklearn.metrics import brier_score_loss, roc_auc_score  # type: ignore import-not-found
    from sklearn.model_selection import train_test_split  # type: ignore import-not-found

    missing_columns = {col for col in (*FEATURES, TARGET) if col not in data.columns}
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")

    df = data.dropna(subset=[*FEATURES, TARGET])
    if df.empty:
        message = "No rows available for training after dropping missing values."
        raise ValueError(message)

    X = df.loc[:, FEATURES]
    y = df.loc[:, TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=random_state, stratify=y
    )

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    prob_test = model.predict_proba(X_test)[:, 1]
    brier = brier_score_loss(y_test, prob_test)
    roc_auc = roc_auc_score(y_test, prob_test)

    return ModelArtifacts(
        model=model,
        features=FEATURES,
        brier=brier,
        roc_auc=roc_auc,
        train_rows=len(X_train),
        test_rows=len(X_test),
    )


def predict_win_probability(
    model: LogisticRegression,
    *,
    score_margin: float,
    seconds_remaining: float,
) -> float:
    """Return the probability of the home team winning."""

    import numpy as np  # type: ignore import-not-found

    X = np.array([[score_margin, seconds_remaining]])
    return float(model.predict_proba(X)[0, 1])


def save_model(
    artifacts: ModelArtifacts,
    filename: str = "baseline_model.joblib",
) -> Path:
    """Persist trained model artifacts to disk."""

    settings = get_settings()
    path = settings.paths.models_dir / filename
    artifacts.save(path)
    return path


def load_model(path: Path | None = None) -> ModelArtifacts:
    """Load model artifacts from disk."""

    import joblib  # type: ignore import-not-found

    settings = get_settings()
    target_path = path or (settings.paths.models_dir / "baseline_model.joblib")
    payload = joblib.load(target_path)
    return ModelArtifacts(
        model=payload["model"],
        features=tuple(payload["features"]),
        brier=float(payload["brier"]),
        roc_auc=float(payload["roc_auc"]),
        train_rows=int(payload["train_rows"]),
        test_rows=int(payload["test_rows"]),
    )


__all__ = [
    "ModelArtifacts",
    "train_baseline_model",
    "predict_win_probability",
    "save_model",
    "load_model",
]
