import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_market_not_implemented():
    response = client.get("/api/v1/market/AAPL")
    assert response.status_code == 501
    assert response.json()["detail"] == "Not Implemented"

def test_portfolio_summary_not_implemented():
    response = client.get("/api/v1/portfolio/summary")
    assert response.status_code == 501
    assert response.json()["detail"] == "Not Implemented"

def test_portfolio_positions_not_implemented():
    response = client.get("/api/v1/portfolio/positions")
    assert response.status_code == 501
    assert response.json()["detail"] == "Not Implemented"

def test_risk_symbol_not_implemented():
    response = client.get("/api/v1/risk/AAPL")
    assert response.status_code == 501

def test_risk_portfolio_malformed():
    response = client.post("/api/v1/risk/portfolio", json={})
    assert response.status_code == 422 # Validation error, missing required field

def test_risk_portfolio_not_implemented():
    response = client.post("/api/v1/risk/portfolio", json={"positions": []})
    assert response.status_code == 501

def test_query_implemented():
    response = client.post("/api/v1/query", json={"query": "test"})
    assert response.status_code == 200

def test_analysis_run_implemented():
    response = client.post("/api/v1/analysis/run", json={"run_id": "1", "parameters": {}})
    assert response.status_code == 200

def test_analysis_results_not_found():
    response = client.get("/api/v1/analysis/123")
    assert response.status_code == 404

def test_events_list_not_implemented():
    response = client.get("/api/v1/events")
    assert response.status_code == 501

def test_events_detail_not_implemented():
    response = client.get("/api/v1/events/123")
    assert response.status_code == 501

def test_recommendations_not_implemented():
    response = client.post("/api/v1/recommendations/hedging")
    assert response.status_code == 501
