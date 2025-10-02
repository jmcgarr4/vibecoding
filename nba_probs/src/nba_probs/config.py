"""Configuration management for the NBA probability project."""

from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Paths(BaseModel):
    """Collection of commonly used project paths."""

    project_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2])
    data_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2] / "data")
    raw_data_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2] / "data" / "raw")
    processed_data_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2] / "data" / "processed")
    models_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2] / "data" / "models")
    polymarket_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2] / "data" / "polymarket")

    def ensure_exists(self) -> None:
        """Create directories if they do not already exist."""

        for path in {
            self.data_dir,
            self.raw_data_dir,
            self.processed_data_dir,
            self.models_dir,
            self.polymarket_dir,
        }:
            path.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    """Runtime configuration derived from environment variables."""

    polymarket_api_key: Optional[str] = Field(default=None, alias="POLYMARKET_API_KEY")
    polymarket_api_secret: Optional[str] = Field(default=None, alias="POLYMARKET_API_SECRET")
    http_proxy: Optional[str] = Field(default=None, alias="HTTP_PROXY")
    https_proxy: Optional[str] = Field(default=None, alias="HTTPS_PROXY")

    paths: Paths = Field(default_factory=Paths)

    model_config = SettingsConfigDict(env_file=Path(__file__).resolve().parents[2] / ".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""

    settings = Settings()  # type: ignore[call-arg]
    settings.paths.ensure_exists()
    return settings


__all__ = ["Settings", "Paths", "get_settings"]
