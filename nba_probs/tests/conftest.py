import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

ROOT = Path(__file__).resolve().parents[1] / "src"
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


@pytest.fixture
def dummy_settings(tmp_path):
    paths = SimpleNamespace(
        project_root=tmp_path,
        data_dir=tmp_path / "data",
        raw_data_dir=tmp_path / "data" / "raw",
        processed_data_dir=tmp_path / "data" / "processed",
        models_dir=tmp_path / "data" / "models",
        polymarket_dir=tmp_path / "data" / "polymarket",
    )

    for path in (
        paths.data_dir,
        paths.raw_data_dir,
        paths.processed_data_dir,
        paths.models_dir,
        paths.polymarket_dir,
    ):
        path.mkdir(parents=True, exist_ok=True)

    return SimpleNamespace(
        paths=paths,
        polymarket_api_key=None,
        polymarket_api_secret=None,
        http_proxy=None,
        https_proxy=None,
    )
