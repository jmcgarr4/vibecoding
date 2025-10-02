import pytest

pytest.importorskip("pydantic")
pytest.importorskip("pydantic_settings")

from nba_probs.config import Paths, get_settings


def test_paths_ensure_exists(tmp_path):
    paths = Paths(
        project_root=tmp_path,
        data_dir=tmp_path / "data",
        raw_data_dir=tmp_path / "data" / "raw",
        processed_data_dir=tmp_path / "data" / "processed",
        models_dir=tmp_path / "data" / "models",
        polymarket_dir=tmp_path / "data" / "polymarket",
    )

    paths.ensure_exists()

    assert paths.data_dir.exists()
    assert paths.raw_data_dir.exists()
    assert paths.processed_data_dir.exists()
    assert paths.models_dir.exists()
    assert paths.polymarket_dir.exists()


def test_get_settings_cached():
    first = get_settings()
    second = get_settings()
    assert first is second
