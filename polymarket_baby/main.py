"""Entrypoint script for the Polymarket Baby project.

This module exposes helpers for polling the public Polymarket API and
formatting trade payloads. A small command-line interface is included: it
defaults to a network-free demo mode but can poll the real API when invoked
with the ``--live`` flag.
"""

from __future__ import annotations

import argparse
import datetime as dt
import itertools
import sys
import time
from typing import Any, Dict, Iterable, Optional, Sequence

import requests

# Base endpoint serving recent trades. The API supports pagination via
# query parameters such as ``limit``. We request a single trade because we
# only care about the latest event.
API_URL = "https://data-api.polymarket.com/trades"

# Number of seconds to wait between API calls (5 minutes).
POLL_INTERVAL_SECONDS = 30

# Sample trades used when the script runs in "demo" mode. They provide a quick
# way to preview the output format without making any network requests—useful
# in restricted environments such as automated tests or sandboxes that cannot
# reach Polymarket's servers.
SAMPLE_TRADES = (
    {
        "market": "Will Bitcoin close above $75k on 2024-12-31?",
        "outcome": "Yes",
        "cost": 42.50,
    },
    {
        "market": {
            "question": "Who will win the 2024 US Presidential Election?",
        },
        "outcome": {"name": "Candidate A"},
        "amount": "18.25",
    },
    {
        "title": "Will a commercial mission land on the Moon this year?",
        "side": "NO",
        "value": 7.75,
    },
)


def _extract_first(iterable: Iterable[Any]) -> Optional[Any]:
    """Return the first element of an iterable or ``None`` if it is empty."""

    for item in iterable:
        return item
    return None


def _coerce_trades(payload: Any) -> Iterable[Dict[str, Any]]:
    """Normalize the JSON payload into an iterable of trade dictionaries.

    The Polymarket API has returned both bare lists and objects with a
    ``data`` field in the past. To keep the script resilient, we look for
    several common patterns and fall back to an empty list if we cannot
    recognize the structure.
    """

    if isinstance(payload, list):
        return payload

    if isinstance(payload, dict):
        for key in ("data", "trades", "results"):
            maybe = payload.get(key)
            if isinstance(maybe, list):
                return maybe

    return []


def _safe_get(trade: Dict[str, Any], *keys: str) -> Optional[Any]:
    """Attempt to retrieve the first non-empty value associated with keys."""

    for key in keys:
        value = trade.get(key)
        if value not in (None, ""):
            return value
    return None


def format_trade(trade: Dict[str, Any]) -> str:
    """Convert a raw trade dictionary into a human-readable string."""

    market = _safe_get(trade, "market", "question", "title")
    if isinstance(market, dict):
        market_question = _safe_get(market, "question", "title", "name") or "Unknown market"
    else:
        market_question = str(market) if market is not None else "Unknown market"

    outcome = _safe_get(trade, "outcome", "side", "token")
    if isinstance(outcome, dict):
        outcome_text = _safe_get(outcome, "name", "label", "title") or "Unknown outcome"
    else:
        outcome_text = str(outcome) if outcome is not None else "Unknown outcome"

    # Extract price and size
    try:
        price = float(_safe_get(trade, "price") or 0)
        size = float(_safe_get(trade, "size") or 0)
    except (TypeError, ValueError):
        price = 0.0
        size = 0.0

    total_value = price * size
    timestamp = dt.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    return (
        f"[{timestamp}] Market: {market_question} | "
        f"Outcome: {outcome_text} | "
        f"Shares: {size:,.2f} | Price: ${price:,.4f} | "
        f"Total: ${total_value:,.2f}"
    )


def fetch_latest_trade() -> Optional[Dict[str, Any]]:
    """Fetch the most recent trade from Polymarket.

    Returns a dictionary representing the trade, or ``None`` when no trade
    data is returned by the API.
    """

    response = requests.get(API_URL, params={"limit": 1}, timeout=30)
    response.raise_for_status()
    payload = response.json()
    trades = _coerce_trades(payload)
    return trades


def run_live_loop() -> None:
    """Continuously poll Polymarket and print information about trades."""

    print("Starting Polymarket Baby trade watcher. Press Ctrl+C to stop.")
    while True:
        try:
            trade = fetch_latest_trade()
        except requests.RequestException as exc:
            # Network problems are expected from time to time. We log the
            # issue and continue looping so the script remains resilient.
            print(f"Error fetching trades: {exc}", file=sys.stderr)
        else:
            if not trade:
                print("No trades returned by the API.")
            else:
                for t in trade:
                    print(format_trade(t))

        # Wait for the requested polling interval before fetching again.
        time.sleep(POLL_INTERVAL_SECONDS)


def run_demo_loop(iterations: int = 3, sleep_seconds: int = 1) -> None:
    """Emit formatted sample trades without contacting the Polymarket API."""

    print(
        "Running in demo mode. Use --live to poll Polymarket. "
        "Press Ctrl+C to stop."
    )
    for idx, trade in zip(range(iterations), itertools.cycle(SAMPLE_TRADES)):
        # ``format_trade`` already handles dictionaries and strings in the same
        # way the live API would deliver them, so we can re-use it for the demo
        # data.
        print(format_trade(trade))
        if idx < iterations - 1:
            time.sleep(sleep_seconds)


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    """Return parsed command-line arguments for the script."""

    parser = argparse.ArgumentParser(description="Poll the Polymarket API")
    parser.add_argument(
        "--live",
        action="store_true",
        help=(
            "Fetch real trades from Polymarket. Without this flag the script "
            "prints sample output only, which is safer in restricted "
            "environments."
        ),
    )
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> None:
    """Entrypoint handling command-line arguments for the script."""

    args = parse_args(argv)
    if args.live:
        run_live_loop()
    else:
        run_demo_loop()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        # Provide a friendly shutdown message when the user stops the script.
        print("\nStopping Polymarket Baby. Goodbye!")

