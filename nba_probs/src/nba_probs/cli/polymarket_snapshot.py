"""CLI for capturing Polymarket orderbook snapshots."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from ..config import get_settings
from ..polymarket import PolymarketClient


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Capture a Polymarket orderbook snapshot",
    )
    parser.add_argument("market_id", help="Polymarket market identifier")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional JSON file to append snapshot data",
    )
    return parser.parse_args()


def main(args: argparse.Namespace | None = None) -> None:
    if args is None:
        args = parse_args()

    settings = get_settings()
    client = PolymarketClient()
    snapshot = client.fetch_orderbook(args.market_id)

    payload = {
        "market_id": snapshot.market_id,
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        "yes_price": snapshot.yes_price,
        "no_price": snapshot.no_price,
        "implied_yes_probability": snapshot.implied_yes_probability,
        "implied_no_probability": snapshot.implied_no_probability,
    }

    if args.output is not None:
        output_path = (
            args.output
            if args.output.is_absolute()
            else settings.paths.polymarket_dir / args.output
        )
        output_path.parent.mkdir(parents=True, exist_ok=True)
        existing = []
        if output_path.exists():
            existing = json.loads(output_path.read_text())
        existing.append(payload)
        output_path.write_text(json.dumps(existing, indent=2))
        print(f"Snapshot appended to {output_path}")
    else:
        print(json.dumps(payload, indent=2))


if __name__ == "__main__":  # pragma: no cover
    main()
