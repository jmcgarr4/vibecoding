# Polymarket Baby

Polymarket Baby is a minimal Python script that polls the public [Polymarket](https://polymarket.com) API every five minutes and prints information about the most recent trade. It is intended as a simple example of working with the Polymarket REST interface.

## Requirements

* Python 3.11 or later (any modern Python 3 should work)
* `requests` for making HTTP calls

## Setup

1. Clone the repository and change into the project directory:

   ```bash
   git clone <your-fork-url>
   cd polymarket_baby
   ```

2. Create a virtual environment (optional but recommended) and install dependencies:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt  # optional helper if you export from pyproject
   ```

   or install directly from the `pyproject.toml` definition:

   ```bash
   pip install .
   ```

   The only required dependency is `requests`.

## Running the script

Execute the polling script with Python:

```bash
python main.py
```

The script will:

1. Fetch the most recent trade from `https://api.polymarket.com` every five minutes.
2. Print the market question, the outcome selected, and the USD amount for the trade.
3. Continue running until you stop it with `Ctrl+C`.

### Expected output

Output will look similar to:

```
[2024-04-29 12:30:00] Market: Who will win the 2024 US Presidential Election? | Outcome: YES on Candidate A | Amount: $23.45
```

Actual values depend on real-time Polymarket activity. If the script cannot reach the API it will log an error and retry after five minutes.

## Notes

* The script uses `time.sleep(300)` to pause between requests as requested.
* Network access to `https://api.polymarket.com` must be available; otherwise the script will raise an error while trying to fetch the latest trade.
* Use `Ctrl+C` to stop the script gracefully.

## Troubleshooting

* **Proxy or firewall issues** – If you are behind a proxy, ensure the appropriate proxy environment variables are configured so `requests` can connect to the Polymarket API.
* **SSL errors** – Make sure your Python installation trusts the CA certificates required by the Polymarket endpoint.

