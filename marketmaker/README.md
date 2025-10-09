# Market Maker Bot Prototypes

This directory contains two experimental versions of a minimal Polymarket market-making bot. Both variants share the same core trading idea:

* Pull the most recent quote for each configured market.
* Place a bid $0.02 below and an ask $0.02 above the most recent price.
* Refresh this quoting logic every five seconds.

> **Warning**
> These bots are examples only. They do not handle production concerns such as balance checks, error recovery, regulatory obligations, or full authentication flows. Use them at your own risk and always test with small amounts first.

## Layout

```
marketmaker/
├── README.md              – This file.
├── config.py              – Shared configuration helpers.
├── client.py              – Minimal Polymarket REST client wrapper.
├── basic_bot.py           – Blocking implementation.
└── async_bot.py           – AsyncIO-based implementation.
```

## Requirements

* Python 3.11+
* `requests`, `python-dotenv`, and (for the async version) `aiohttp`

Install dependencies:

```bash
pip install -r requirements.txt
```

Copy the sample environment file and fill in your credentials:

```bash
cp .env.example .env
```

## Running the Bots

### Blocking Version

```bash
python basic_bot.py --markets MARKET_ID1 MARKET_ID2
```

### Async Version

```bash
python async_bot.py --markets MARKET_ID1 MARKET_ID2
```

Both scripts accept the following options:

* `--markets`: One or more Polymarket market IDs to quote.
* `--spread`: Half-spread (default 0.02) added/subtracted from the mid price when quoting.
* `--interval`: Seconds between quote refresh cycles (default 5 seconds).
* `--size`: Quantity per order (default 10 shares).

Review each file for additional customisation hooks.
