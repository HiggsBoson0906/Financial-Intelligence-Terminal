import requests, json
resp = requests.post("http://localhost:8000/api/v1/query", json={"query": "Oil shock impact on portfolio"})
data = resp.json()
with open("query_output.json", "w") as f:
    json.dump(data, f, indent=2)
print("status code:", resp.status_code)
print("historical matches:", len(data.get("historical_matches", [])))
print("recommendations:", len(data.get("recommendations", [])))
print("risk var95:", data.get("risk", {}).get("metrics", {}).get("var_95"))
print("summary:", data.get("answer", {}).get("summary"))
print("warnings:", data.get("data_quality", {}).get("warnings"))
