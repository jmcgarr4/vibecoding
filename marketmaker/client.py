"""Very small Polymarket REST client used by both bot variants."""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional

import requests

from config import Settings

try:  # pragma: no cover - optional dependency guard
    import aiohttp
except ImportError:  # pragma: no cover - optional dependency guard
    aiohttp = None

LOG = logging.getLogger(__name__)


@dataclass
class Quote:
    """Represents the most recent market quote used for pricing."""

    market_id: str
    outcome_id: str
    price: float
    timestamp: float


class PolymarketClient:
    """Tiny helper around the Polymarket public and trading APIs.

    The real trading API requires a signature that is outside the scope of this
    example. For demonstration purposes we only attach the API key header and
    assume the `private_key` has been used elsewhere to sign requests if
    necessary.
    """

    PUBLIC_BASE_URL = "https://gamma-api.polymarket.com"
    TRADING_BASE_URL = "https://trading-api.polymarket.com"

    def __init__(self, settings: Settings, session: Optional[requests.Session] = None) -> None:
        self._settings = settings
        self._session = session or requests.Session()
        self._session.headers.update({"X-API-Key": settings.api_key})

    # ------------------------------------------------------------------
    # Public market data
    # ------------------------------------------------------------------
    def fetch_market(self, market_id: str) -> Dict[str, Any]:
        """Return the raw market payload from the public API."""

        url = f"{self.PUBLIC_BASE_URL}/markets/{market_id}"
        response = self._session.get(url, timeout=10)
        response.raise_for_status()
        return response.json()

    def latest_quote(self, market_id: str) -> Quote:
        """Extract a simplified quote structure for the given market."""

        market = self.fetch_market(market_id)
        try:
            outcome = market["outcomes"][0]
            price = float(outcome.get("price", outcome.get("lastPrice")))
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            raise RuntimeError(f"Unable to parse quote for market {market_id}") from exc

        return Quote(
            market_id=market_id,
            outcome_id=outcome.get("id", ""),
            price=price,
            timestamp=time.time(),
        )

    # ------------------------------------------------------------------
    # Trading endpoints (simplified)
    # ------------------------------------------------------------------
    def create_order(
        self,
        market_id: str,
        outcome_id: str,
        side: str,
        price: float,
        size: float,
    ) -> Dict[str, Any]:
        """Submit an order to the trading API.

        The payload fields are indicative; consult the official Polymarket
        documentation for the exact schema required by the live API.
        """

        payload = {
            "marketId": market_id,
            "outcomeId": outcome_id,
            "side": side,
            "price": price,
            "size": size,
            "walletAddress": self._settings.wallet_address,
        }
        url = f"{self.TRADING_BASE_URL}/orders"
        response = self._session.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()

    def cancel_all_orders(self, market_id: str) -> Dict[str, Any]:
        """Cancel every open order for the configured wallet in a market."""

        url = f"{self.TRADING_BASE_URL}/orders/cancel"
        payload = {
            "marketId": market_id,
            "walletAddress": self._settings.wallet_address,
        }
        response = self._session.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()


class AsyncPolymarketClient:
    """Asynchronous flavour of :class:`PolymarketClient`."""

    PUBLIC_BASE_URL = PolymarketClient.PUBLIC_BASE_URL
    TRADING_BASE_URL = PolymarketClient.TRADING_BASE_URL

    def __init__(self, settings: Settings, session: Optional[aiohttp.ClientSession] = None) -> None:
        if aiohttp is None:  # pragma: no cover - runtime guard
            raise RuntimeError("aiohttp is not installed; install requirements.txt first")

        self._settings = settings
        self._session = session

    async def _session_ctx(self) -> aiohttp.ClientSession:
        if self._session is None:
            self._session = aiohttp.ClientSession(
                headers={"X-API-Key": self._settings.api_key}
            )
        return self._session

    async def close(self) -> None:
        if self._session:
            await self._session.close()

    # ------------------------------------------------------------------
    async def fetch_market(self, market_id: str) -> Dict[str, Any]:
        session = await self._session_ctx()
        url = f"{self.PUBLIC_BASE_URL}/markets/{market_id}"
        async with session.get(url, timeout=10) as response:
            response.raise_for_status()
            return await response.json()

    async def latest_quote(self, market_id: str) -> Quote:
        market = await self.fetch_market(market_id)
        try:
            outcome = market["outcomes"][0]
            price = float(outcome.get("price", outcome.get("lastPrice")))
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            raise RuntimeError(f"Unable to parse quote for market {market_id}") from exc

        return Quote(
            market_id=market_id,
            outcome_id=outcome.get("id", ""),
            price=price,
            timestamp=time.time(),
        )

    async def create_order(
        self,
        market_id: str,
        outcome_id: str,
        side: str,
        price: float,
        size: float,
    ) -> Dict[str, Any]:
        session = await self._session_ctx()
        url = f"{self.TRADING_BASE_URL}/orders"
        payload = {
            "marketId": market_id,
            "outcomeId": outcome_id,
            "side": side,
            "price": price,
            "size": size,
            "walletAddress": self._settings.wallet_address,
        }
        async with session.post(url, json=payload, timeout=10) as response:
            response.raise_for_status()
            return await response.json()

    async def cancel_all_orders(self, market_id: str) -> Dict[str, Any]:
        session = await self._session_ctx()
        url = f"{self.TRADING_BASE_URL}/orders/cancel"
        payload = {
            "marketId": market_id,
            "walletAddress": self._settings.wallet_address,
        }
        async with session.post(url, json=payload, timeout=10) as response:
            response.raise_for_status()
            return await response.json()
