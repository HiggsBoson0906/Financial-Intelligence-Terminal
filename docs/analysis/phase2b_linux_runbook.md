# Phase 2B: Linux ML Execution Runbook

This runbook describes the exact sequence for executing the Phase 2B Machine Learning and Quantitative Validation pipelines on a clean Linux EC2 environment (CPU-only).

## Prerequisites
- Clean Ubuntu/Amazon Linux environment with Python 3.11+.
- Access to the repository.

## Execution Sequence

### 1. Clone & Setup Repository
```bash
git clone https://github.com/HiggsBoson0906/Financial-Intelligence-Terminal.git
cd Financial-Intelligence-Terminal
git checkout backend
```

### 2. Environment Configuration
Create the virtual environment and install ML requirements securely:
```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements-ml.txt
```

### 3. Provide Secrets
Configure the `.env` file with necessary keys (e.g., FRED):
```bash
cp .env.example .env
nano .env # Insert FRED_API_KEY
```

### 4. Verify Clean Environment
Ensure all dependencies are properly installed for execution.
```bash
python scripts/check_phase2b_environment.py
```
*Expectation: SUCCESS: Environment is ready for Phase 2B. Status for all mandatory packages must be OK.*

### 5. Run Unit Tests
Run the core tests that validate data integrity, splitting, and risk implementations:
```bash
python -m pytest tests/
```
*Expectation: All core tests pass. Any ML tests missing local test dependencies (like mocking frameworks) should gracefully skip.*

### 6. Run Full Validation Pipeline
Execute the deterministic Phase 2B evaluation script.
```bash
python scripts/phase2b_validation.py --full
```
*Note: This strictly executes without installing packages. FinBERT runs strictly in CPU inference mode (`device=-1`). SHAP will extract feature importance.*

### 7. Inspect Outputs
Review the generated reports and machine-readable data:
- `docs/analysis/model_evaluation.md`: Contains exactly how the ML beats baselines.
- `docs/analysis/risk_validation.md`: Contains verified Risk CVaR and Scenario Stress vectors.
- `data/processed/model_results/`: Review CSV audit records and feature importance outputs.
