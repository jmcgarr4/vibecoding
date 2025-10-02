"""CLI for downloading historical NBA play-by-play data."""

from __future__ import annotations

import argparse
from pathlib import Path

from ..config import get_settings
from ..data_pipeline import batch_fetch


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download NBA games and summarize by minute",
    )
    parser.add_argument("game_ids", nargs="+", help="NBA game IDs to download")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional path to save the concatenated dataset (Parquet format)",
    )
    parser.add_argument(
        "--no-progress",
        action="store_true",
        help="Disable tqdm progress bar",
    )
    return parser.parse_args()


def main(args: argparse.Namespace | None = None) -> None:
    if args is None:
        args = parse_args()

    settings = get_settings()
    dataset = batch_fetch(args.game_ids, show_progress=not args.no_progress)

    if args.output is not None:
        output_path = args.output
    else:
        output_path = settings.paths.processed_data_dir / "minutes.parquet"

    output_path.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_parquet(output_path, index=False)
    print(f"Saved {len(dataset)} rows to {output_path}")


if __name__ == "__main__":  # pragma: no cover
    main()
