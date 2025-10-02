# NBA Probabilities Toolkit

This sub-project provides a structured path for building a tool that compares
real-time NBA win probability estimates with Polymarket betting odds. The goal
is to help you iterate from learning the basics of data collection all the way
to creating a production-ready pipeline for spotting pricing discrepancies.

The project is organized as a conventional Python package so that you can run
experiments in notebooks while still having reusable, tested code. The
accompanying documentation walks you through each milestone.

## Repository layout

```
nba_probs/
├── README.md                # High-level overview (this file)
├── docs/                    # Step-by-step guides and research notes
├── data/                    # Local storage for raw/interim data (ignored by git)
├── notebooks/               # Jupyter notebooks for exploration and modeling
├── pyproject.toml           # Python project configuration
└── src/nba_probs/           # Reusable Python package code
```

## Getting started quickly

1. **Create a virtual environment** (Python 3.10+ recommended) and install the
   dependencies listed in `pyproject.toml`.
2. **Follow `docs/STEP_BY_STEP.md`** for a guided walkthrough of the entire
   workflow—from gathering play-by-play data to comparing it with Polymarket
   odds.
3. Keep exploration notebooks in the `notebooks/` directory and promote any
   reusable code into `src/nba_probs/`.
4. Use version control: commit frequently and document your progress in the
   `docs/` directory as you explore data sources and refine your modeling
   approach.

## Running tests

Install the development dependencies and execute the test suite:

```bash
pip install -e .[dev]
pytest
```

To run only the CLI-focused smoke tests:

```bash
pytest -m cli
```

Happy building!
