"""Lightweight client for interacting with the Polymarket API."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional

import requests

from .config import get_settings

POLYMARKET_BASE_URL = "https://gamma-api.polymarket.com"


@dataclass
class Market:
    """Simplified representation of a Polymarket market."""

    id: str
    question: str
    status: str
    outcome_yes: Optional[str]
    outcome_no: Optional[str]


@dataclass
class Orderbook:
    """Orderbook snapshot for a binary Polymarket market."""

    market_id: str
    yes_price: Optional[float]
    no_price: Optional[float]

    @property
    def implied_yes_probability(self) -> Optional[float]:
        if self.yes_price is None:
            return None
        return self.yes_price

    @property
    def implied_no_probability(self) -> Optional[float]:
        if self.no_price is None:
            return None
        return self.no_price


class PolymarketClient:
    """Simple wrapper around Polymarket's HTTP API."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.session = requests.Session()
        if self.settings.http_proxy:
            self.session.proxies["http"] = self.settings.http_proxy
        if self.settings.https_proxy:
            self.session.proxies["https"] = self.settings.https_proxy

    def _request(self, method: str, path: str, **kwargs: Any) -> Any:
        url = f"{POLYMARKET_BASE_URL}{path}"
        try:
            response = self.session.request(method, url, timeout=10, **kwargs)
            response.raise_for_status()
        except requests.Timeout as exc:  # pragma: no cover - network errors
            raise RuntimeError("Polymarket request timed out") from exc
        except requests.HTTPError as exc:  # pragma: no cover - depends on API
            status = exc.response.status_code if exc.response is not None else "unknown"
            raise RuntimeError(f"Polymarket request failed with status {status}") from exc
        except requests.RequestException as exc:  # pragma: no cover - network errors
            raise RuntimeError("Polymarket request failed") from exc

        try:
            return response.json()
        except ValueError as exc:
            raise RuntimeError("Polymarket response was not valid JSON") from exc

    def list_nba_markets(self) -> List[Market]:
        payload = self._request("GET", "/markets", params={"tag": "NBA"})
        markets = []
        for raw in payload.get("markets", []):
            markets.append(
                Market(
                    id=raw["id"],
                    question=raw.get("question", ""),
                    status=raw.get("status", ""),
                    outcome_yes=(raw.get("outcomePrices") or {}).get("yes"),
                    outcome_no=(raw.get("outcomePrices") or {}).get("no"),
                )
            )
        return markets

    def fetch_orderbook(self, market_id: str) -> Orderbook:
        payload = self._request("GET", f"/markets/{market_id}")
        outcome_prices = payload.get("outcomePrices", {})
        return Orderbook(
            market_id=market_id,
            yes_price=self._safe_float(outcome_prices.get("yes")),
            no_price=self._safe_float(outcome_prices.get("no")),
        )

    @staticmethod
    def _safe_float(value: Any) -> Optional[float]:
        try:
            return float(value)
        except (TypeError, ValueError):
            return None


__all__ = ["PolymarketClient", "Market", "Orderbook"]
