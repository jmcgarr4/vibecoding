import pytest

pytest.importorskip("requests")

from nba_probs.polymarket import Orderbook, PolymarketClient


def test_orderbook_implied_probabilities():
    orderbook = Orderbook(market_id="abc", yes_price=0.62, no_price=0.4)
    assert orderbook.implied_yes_probability == 0.62
    assert orderbook.implied_no_probability == 0.4


def test_safe_float_handles_invalid_values():
    assert PolymarketClient._safe_float(None) is None
    assert PolymarketClient._safe_float("not-a-number") is None
    assert PolymarketClient._safe_float("0.55") == 0.55
