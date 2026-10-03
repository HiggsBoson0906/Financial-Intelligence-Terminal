import pytest
import pandas as pd
from backend.app.services.fred_service import FREDService
from unittest.mock import patch, MagicMock

def test_fred_service_initialization():
    # Should not crash if API key is missing
    service = FREDService(api_key=None)
    assert service.api_key is None or isinstance(service.api_key, str)

@patch('backend.app.services.fred_service.requests.get')
def test_fred_service_api_success(mock_get):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "observations": [
            {"date": "2020-01-01", "value": "1.5"},
            {"date": "2020-01-02", "value": "."}
        ]
    }
    mock_get.return_value = mock_response
    
    service = FREDService(api_key="mock_key")
    df = service.fetch_series("DFF", "2020-01-01", "2020-01-02")
    
    assert not df.empty
    assert len(df) == 2
    assert df['date'].iloc[0] == "2020-01-01"
    assert df['value'].iloc[0] == 1.5
    assert pd.isna(df['value'].iloc[1]) # Malformed "." becomes NaN

@patch('backend.app.services.fred_service.requests.get')
def test_fred_service_fallback(mock_get):
    # Simulate API failure, then CSV fallback success
    
    def side_effect(*args, **kwargs):
        mock_resp = MagicMock()
        if "api.stlouisfed.org" in args[0]:
            mock_resp.raise_for_status.side_effect = Exception("API Error")
            return mock_resp
        else:
            # CSV response
            mock_resp.text = "DATE,DFF\n2020-01-01,1.5\n2020-01-02,.\n"
            return mock_resp
            
    mock_get.side_effect = side_effect
    
    service = FREDService(api_key="mock_key")
    df = service.fetch_series("DFF", "2020-01-01", "2020-01-02")
    
    assert not df.empty
    assert len(df) == 2
    assert df['value'].iloc[0] == 1.5
    assert pd.isna(df['value'].iloc[1])
