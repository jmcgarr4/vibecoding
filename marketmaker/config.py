"""Configuration helpers shared by the market maker prototypes."""
from __future__ import annotations

import argparse
import os
from dataclasses import dataclass
from typing import Iterable, List

from dotenv import load_dotenv


@dataclass
class Settings:
    """Runtime configuration for interacting with the Polymarket API."""

    api_key: str
    wallet_address: str
    private_key: str


def load_settings() -> Settings:
    """Load settings from environment variables (.env supported)."""

    load_dotenv()

    api_key = os.getenv("POLYMARKET_API_KEY", "")
    wallet_address = os.getenv("POLYMARKET_WALLET_ADDRESS", "")
    private_key = os.getenv("POLYMARKET_PRIVATE_KEY", "")

    missing = [
        name
        for name, value in {
            "POLYMARKET_API_KEY": api_key,
            "POLYMARKET_WALLET_ADDRESS": wallet_address,
            "POLYMARKET_PRIVATE_KEY": private_key,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(
            "Missing Polymarket credentials: " + ", ".join(missing)
        )

    return Settings(api_key=api_key, wallet_address=wallet_address, private_key=private_key)


def build_arg_parser(description: str) -> argparse.ArgumentParser:
    """Construct the common CLI argument parser."""

    parser = argparse.ArgumentParser(description=description)
    parser.add_argument(
        "--markets",
        nargs="+",
        required=True,
        help="One or more Polymarket market IDs to make markets on.",
    )
    parser.add_argument(
        "--spread",
        type=float,
        default=0.02,
        help="Half-spread to quote around the latest price (default: 0.02)",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=5.0,
        help="Seconds to wait between refresh cycles (default: 5)",
    )
    parser.add_argument(
        "--size",
        type=float,
        default=10.0,
        help="Per-order size in shares (default: 10)",
    )
    return parser


def parse_markets(raw_markets: Iterable[str]) -> List[str]:
    """Normalise a user-provided iterable of market identifiers."""

    return [market.strip() for market in raw_markets if market.strip()]
