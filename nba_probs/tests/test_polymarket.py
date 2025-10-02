from unittest.mock import Mock

import pytest

pytest.importorskip("requests")
import requests

from nba_probs.polymarket import Orderbook, PolymarketClient


@pytest.fixture
def client(monkeypatch, dummy_settings):
    monkeypatch.setattr("nba_probs.polymarket.get_settings", lambda: dummy_settings)
    return PolymarketClient()


def _set_response(
    monkeypatch,
    client,
    *,
    status=200,
    json_payload=None,
    exception=None,
    json_exception=None,
):
    def fake_request(method, url, timeout=10, **kwargs):
        if exception:
            raise exception
        response = Mock()
        response.status_code = status
        if status >= 400:
            http_error = requests.HTTPError(response=Mock(status=status))
            response.raise_for_status.side_effect = http_error
        else:
            response.raise_for_status.side_effect = None
        response.raise_for_status.return_value = None
        if json_exception:
            response.json.side_effect = json_exception
        else:
            response.json.return_value = json_payload or {}
        return response

    monkeypatch.setattr(client.session, "request", fake_request)


def test_fetch_orderbook_parses_prices(monkeypatch, client):
    market_id = "abc"
    _set_response(
        monkeypatch,
        client,
        json_payload={"outcomePrices": {"yes": "0.55", "no": "0.45"}},
    )

    orderbook = client.fetch_orderbook(market_id)

    assert orderbook.market_id == market_id
    assert 0 <= orderbook.implied_yes_probability <= 1
    assert 0 <= orderbook.implied_no_probability <= 1


def test_fetch_orderbook_handles_missing_fields(monkeypatch, client):
    market_id = "def"
    _set_response(monkeypatch, client, json_payload={})

    orderbook = client.fetch_orderbook(market_id)
    assert orderbook.yes_price is None
    assert orderbook.no_price is None


def test_fetch_orderbook_raises_on_http_error(monkeypatch, client):
    market_id = "ghi"
    _set_response(monkeypatch, client, status=500)

    with pytest.raises(RuntimeError):
        client.fetch_orderbook(market_id)


def test_fetch_orderbook_times_out(monkeypatch, client):
    market_id = "jkl"
    _set_response(monkeypatch, client, exception=requests.Timeout("timeout"))

    with pytest.raises(RuntimeError):
        client.fetch_orderbook(market_id)


def test_fetch_orderbook_bad_json(monkeypatch, client):
    market_id = "mno"
    _set_response(monkeypatch, client, json_exception=ValueError("invalid json"))

    with pytest.raises(RuntimeError):
        client.fetch_orderbook(market_id)


def test_orderbook_implied_probabilities():
    orderbook = Orderbook(market_id="abc", yes_price=0.62, no_price=0.4)
    assert orderbook.implied_yes_probability == 0.62
    assert orderbook.implied_no_probability == 0.4


def test_safe_float_handles_invalid_values():
    assert PolymarketClient._safe_float(None) is None
    assert PolymarketClient._safe_float("not-a-number") is None
    assert PolymarketClient._safe_float("0.55") == 0.55
