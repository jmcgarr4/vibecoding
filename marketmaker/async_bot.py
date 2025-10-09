"""AsyncIO implementation of the Polymarket market maker bot."""
from __future__ import annotations

import asyncio
import logging
import sys
import time
from typing import Sequence

from client import AsyncPolymarketClient
from config import build_arg_parser, load_settings, parse_markets

LOG = logging.getLogger("marketmaker.async")


def clip_price(price: float) -> float:
    return max(0.01, min(0.99, round(price, 4)))


async def refresh_market(
    client: AsyncPolymarketClient,
    market_id: str,
    spread: float,
    size: float,
) -> None:
    try:
        quote = await client.latest_quote(market_id)
        bid = clip_price(quote.price - spread)
        ask = clip_price(quote.price + spread)
        LOG.info("%s | mid=%.4f bid=%.4f ask=%.4f", market_id, quote.price, bid, ask)

        await client.cancel_all_orders(market_id)
        await client.create_order(
            market_id=market_id,
            outcome_id=quote.outcome_id,
            side="buy",
            price=bid,
            size=size,
        )
        await client.create_order(
            market_id=market_id,
            outcome_id=quote.outcome_id,
            side="sell",
            price=ask,
            size=size,
        )
    except Exception as exc:  # noqa: BLE001 - broad logging for demo simplicity
        LOG.exception("Failed to refresh market %s: %s", market_id, exc)


async def run_loop(
    client: AsyncPolymarketClient,
    markets: Sequence[str],
    spread: float,
    size: float,
    interval: float,
) -> None:
    while True:
        cycle_start = time.monotonic()
        await asyncio.gather(
            *(
                refresh_market(
                    client=client,
                    market_id=market_id,
                    spread=spread,
                    size=size,
                )
                for market_id in markets
            )
        )
        elapsed = time.monotonic() - cycle_start
        sleep_for = max(0.0, interval - elapsed)
        if sleep_for:
            await asyncio.sleep(sleep_for)


async def async_main(argv: Sequence[str] | None = None) -> int:
    parser = build_arg_parser("Async market maker bot")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    try:
        settings = load_settings()
    except RuntimeError as exc:
        LOG.error("%s", exc)
        return 1

    client = AsyncPolymarketClient(settings=settings)
    markets = parse_markets(args.markets)
    LOG.info("Starting async market maker for %d markets", len(markets))

    try:
        await run_loop(
            client=client,
            markets=markets,
            spread=float(args.spread),
            size=float(args.size),
            interval=float(args.interval),
        )
    except KeyboardInterrupt:
        LOG.info("Received interrupt, shutting down")
    finally:
        await client.close()
    return 0


def main() -> int:
    return asyncio.run(async_main())


if __name__ == "__main__":
    sys.exit(main())
