"""Entrypoint script for the Polymarket Baby project.

This module contains a small polling loop that calls the public
Polymarket API every five minutes and prints information about the
most recent trade. The script runs indefinitely until it is stopped
manually.
"""

from __future__ import annotations

import datetime as dt
import sys
import time
from typing import Any, Dict, Iterable, Optional

import requests

# Base endpoint serving recent trades. The API supports pagination via
# query parameters such as ``limit``. We request a single trade because we
# only care about the latest event.
API_URL = "https://api.polymarket.com/trades"

# Number of seconds to wait between API calls (5 minutes).
POLL_INTERVAL_SECONDS = 300


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

    amount_usd = _safe_get(trade, "cost", "amount", "value", "priceUsd")
    try:
        amount_number = float(amount_usd) if amount_usd is not None else 0.0
    except (TypeError, ValueError):
        amount_number = 0.0

    timestamp = dt.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    return (
        f"[{timestamp}] Market: {market_question} | "
        f"Outcome: {outcome_text} | Amount: ${amount_number:,.2f}"
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
    return _extract_first(trades)


def main() -> None:
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
            if trade is None:
                print("No trades returned by the API.")
            else:
                print(format_trade(trade))

        # Wait for the requested polling interval before fetching again.
        time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        # Provide a friendly shutdown message when the user stops the script.
        print("\nStopping Polymarket Baby. Goodbye!")

