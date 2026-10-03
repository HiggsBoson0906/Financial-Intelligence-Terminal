# API Contract

Base path: `/api/v1`

## Common Response / Error Contract
We use a consistent error structure for all failures:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```
Where useful, successful responses and error responses may expose:
- `timestamp`: The time of the response.
- `request_id`: A unique identifier for the request trace.
- `api_version`: The version of the API (e.g., `v1`).

---

## Endpoints

### 1. Health Check
- **Method:** `GET`
- **URL:** `/health`
- **Purpose:** Verifies that the service is running.
- **Request:** None
- **Response:** `{"status": "ok"}`
- **Validation:** None
- **Possible Errors:** None
- **Expected HTTP Status Codes:** `200 OK`
- **Intended Frontend Consumer:** Infrastructure / Load Balancers

### 2. Portfolio Summary
- **Method:** `GET`
- **URL:** `/api/v1/portfolio/summary`
- **Purpose:** Retrieves the total value and high-level summary of the portfolio.
- **Request:** None
- **Response:** `PortfolioSummary`
- **Validation:** None
- **Possible Errors:** Internal Server Error, Unauthorized
- **Expected HTTP Status Codes:** `200 OK`, `501 Not Implemented`
- **Intended Frontend Consumer:** Dashboard Overview

### 3. Portfolio Positions
- **Method:** `GET`
- **URL:** `/api/v1/portfolio/positions`
- **Purpose:** Retrieves a detailed list of open positions.
- **Request:** None
- **Response:** `List[PortfolioPosition]`
- **Validation:** None
- **Possible Errors:** Internal Server Error, Unauthorized
- **Expected HTTP Status Codes:** `200 OK`, `501 Not Implemented`
- **Intended Frontend Consumer:** Portfolio Table / Assets View

### 4. Market Data
- **Method:** `GET`
- **URL:** `/api/v1/market/{symbol}`
- **Purpose:** Fetches current market observation for a given symbol.
- **Request:** Path parameter `symbol` (string)
- **Response:** `MarketObservation`
- **Validation:** `symbol` must be valid ticker format.
- **Possible Errors:** 404 Not Found (Symbol not found)
- **Expected HTTP Status Codes:** `200 OK`, `404 Not Found`, `501 Not Implemented`
- **Intended Frontend Consumer:** Asset Detail View

### 5. Risk Metrics (Symbol)
- **Method:** `GET`
- **URL:** `/api/v1/risk/{symbol}`
- **Purpose:** Calculates and returns risk metrics for a specific asset.
- **Request:** Path parameter `symbol`
- **Response:** `RiskMetrics`
- **Validation:** `symbol` must be valid ticker format.
- **Possible Errors:** 404 Not Found
- **Expected HTTP Status Codes:** `200 OK`, `404 Not Found`, `501 Not Implemented`
- **Intended Frontend Consumer:** Risk Analysis Panel

### 6. Portfolio Risk
- **Method:** `POST`
- **URL:** `/api/v1/risk/portfolio`
- **Purpose:** Calculates risk across an entire provided portfolio.
- **Request:** `PortfolioRiskRequest` (contains list of positions)
- **Response:** `RiskMetrics`
- **Validation:** Must contain a valid list of positions with quantities.
- **Possible Errors:** 422 Unprocessable Entity (Malformed positions)
- **Expected HTTP Status Codes:** `200 OK`, `422 Unprocessable Entity`, `501 Not Implemented`
- **Intended Frontend Consumer:** Scenario Simulator / Risk Dashboard

### 7. Natural Language Query
- **Method:** `POST`
- **URL:** `/api/v1/query`
- **Purpose:** Submits a natural language query for the AI to process.
- **Request:** `QueryRequest`
- **Response:** `AgentResult`
- **Validation:** `query` must be a non-empty string.
- **Possible Errors:** 400 Bad Request, 500 Agent Failure
- **Expected HTTP Status Codes:** `200 OK`, `422 Unprocessable Entity`, `501 Not Implemented`
- **Intended Frontend Consumer:** Chat / Intelligence Interface

### 8. Run Analysis
- **Method:** `POST`
- **URL:** `/api/v1/analysis/run`
- **Purpose:** Triggers a comprehensive multi-agent analysis run.
- **Request:** `AnalysisRunRequest`
- **Response:** `AuditRecord`
- **Validation:** Must provide valid parameters for the analysis.
- **Possible Errors:** 400 Bad Request
- **Expected HTTP Status Codes:** `200 OK`, `422 Unprocessable Entity`, `501 Not Implemented`
- **Intended Frontend Consumer:** Analysis Trigger Button

### 9. Get Analysis Results
- **Method:** `GET`
- **URL:** `/api/v1/analysis/{run_id}`
- **Purpose:** Fetches the results and audit record for a past analysis run.
- **Request:** Path parameter `run_id`
- **Response:** `AuditRecord`
- **Validation:** `run_id` must be valid UUID or ID string.
- **Possible Errors:** 404 Not Found
- **Expected HTTP Status Codes:** `200 OK`, `404 Not Found`, `501 Not Implemented`
- **Intended Frontend Consumer:** Analysis History / Report View

### 10. List Events
- **Method:** `GET`
- **URL:** `/api/v1/events`
- **Purpose:** Retrieves historical events tracked in the system.
- **Request:** Query parameters for filtering (optional)
- **Response:** `List[HistoricalEvent]`
- **Validation:** None
- **Possible Errors:** Internal Server Error
- **Expected HTTP Status Codes:** `200 OK`, `501 Not Implemented`
- **Intended Frontend Consumer:** Events Timeline

### 11. Get Event Details
- **Method:** `GET`
- **URL:** `/api/v1/events/{event_id}`
- **Purpose:** Fetches details for a specific historical event.
- **Request:** Path parameter `event_id`
- **Response:** `HistoricalEvent`
- **Validation:** `event_id` must be valid.
- **Possible Errors:** 404 Not Found
- **Expected HTTP Status Codes:** `200 OK`, `404 Not Found`, `501 Not Implemented`
- **Intended Frontend Consumer:** Event Detail Modal

### 12. Hedging Recommendations
- **Method:** `POST`
- **URL:** `/api/v1/recommendations/hedging`
- **Purpose:** Generates risk mitigation and hedging strategies.
- **Request:** Optional portfolio constraints.
- **Response:** `List[HedgingRecommendation]`
- **Validation:** None
- **Possible Errors:** 500 Strategy Generation Failed
- **Expected HTTP Status Codes:** `200 OK`, `501 Not Implemented`
- **Intended Frontend Consumer:** Hedging Suggestions Panel
