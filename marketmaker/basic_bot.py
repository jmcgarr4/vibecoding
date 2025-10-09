"""Blocking (threaded) version of the Polymarket market maker bot."""
from __future__ import annotations

import logging
import sys
import time
from typing import Sequence

from client import PolymarketClient
from config import build_arg_parser, load_settings, parse_markets

LOG = logging.getLogger("marketmaker.basic")


def clip_price(price: float) -> float:
    """Ensure the price stays within Polymarket's [0.01, 0.99] range."""

    return max(0.01, min(0.99, round(price, 4)))


def run_loop(client: PolymarketClient, markets: Sequence[str], spread: float, size: float, interval: float) -> None:
    """Continuously refresh quotes for the configured markets."""

    while True:
        cycle_start = time.time()
        for market_id in markets:
            try:
                quote = client.latest_quote(market_id)
                bid = clip_price(quote.price - spread)
                ask = clip_price(quote.price + spread)

                LOG.info("%s | mid=%.4f bid=%.4f ask=%.4f", market_id, quote.price, bid, ask)

                client.cancel_all_orders(market_id)
                client.create_order(
                    market_id=market_id,
                    outcome_id=quote.outcome_id,
                    side="buy",
                    price=bid,
                    size=size,
                )
                client.create_order(
                    market_id=market_id,
                    outcome_id=quote.outcome_id,
                    side="sell",
                    price=ask,
                    size=size,
                )
            except Exception as exc:  # noqa: BLE001 - demo tool, log everything
                LOG.exception("Failed to refresh market %s: %s", market_id, exc)

        elapsed = time.time() - cycle_start
        sleep_for = max(0.0, interval - elapsed)
        if sleep_for:
            time.sleep(sleep_for)


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_arg_parser("Blocking market maker bot")
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

    client = PolymarketClient(settings=settings)
    markets = parse_markets(args.markets)
    LOG.info("Starting blocking market maker for %d markets", len(markets))

    try:
        run_loop(
            client=client,
            markets=markets,
            spread=float(args.spread),
            size=float(args.size),
            interval=float(args.interval),
        )
    except KeyboardInterrupt:
        LOG.info("Received interrupt, shutting down")
    return 0


if __name__ == "__main__":
    sys.exit(main())
