# PolicyWise Backend

FastAPI backend for PolicyWise — AI-Powered Health Insurance Policy Analyzer.

## Requirements

- Python 3.11+
- pip
- SQLite for development
- PostgreSQL-compatible SQLAlchemy architecture for production

## Setup

```bash
cd backend
python -m venv .venv
```

Windows:
```bash
.venv\Scripts\activate
```

macOS/Linux:
```bash
source .venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create environment file:
```bash
copy .env.example .env
```
(or `cp .env.example .env` on macOS/Linux)

Set a strong `JWT_SECRET` before any non-local deployment.

## Environment variables

- `DATABASE_URL` — default `sqlite:///./policywise.db`
- `JWT_SECRET` — signing secret; never commit it
- `JWT_ALGORITHM` — default `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` — default 60
- `AI_API_KEY` — optional key used by the AI teammate if needed
- `AI_MODEL` — optional AI model identifier
- `AI_ASSISTANT_MODULE` — Python import path for the AI teammate module
- `FRONTEND_URL` — frontend origin, e.g. `http://localhost:5173`
- `UPLOAD_DIR` — private policy storage directory
- `MAX_UPLOAD_SIZE_MB` — default 10

## Database

Tables are created automatically when the app starts. For production, point `DATABASE_URL` to PostgreSQL and use migrations such as Alembic rather than relying on `create_all`.

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger/OpenAPI:
`http://127.0.0.1:8000/docs`

Health:
`http://127.0.0.1:8000/health`

## AI module integration

The backend does not implement RAG. Set:
```env
AI_ASSISTANT_MODULE=your_ai_module
```

The module must expose:
```python
def ingest_policy(policy_id: str, document_path: str):
    ...

def ask_policy_question(policy_id: str, question: str):
    ...
```

Both functions may be synchronous or asynchronous.

`ingest_policy` may return structured data:
```python
{
    "overview": {
        "provider": "...",
        "policy_name": "...",
        "coverage_summary": "...",
        "waiting_periods": [],
        "exclusions": [],
        "deductibles": [],
        "copay": [],
        "limits": []
    },
    "rules": {
        "treatments": {
            "Knee Replacement": {
                "covered": True,
                "coverage_percentage": 80,
                "max_limit": 300000,
                "deductible": 10000,
                "copay_percentage": 20,
                "required_information": ["network_status"]
            }
        }
    }
}
```
This is an interface contract, not a hardcoded policy. The actual values must come from the AI/document processing pipeline.

`ask_policy_question` should return:
```python
{
    "answer": "...",
    "citations": [{"text": "...", "page": 1, "section": "..."}],
    "confidence": 0.0,
    "missing_information": []
}
```

## Cost dataset

`app/data/cost_dataset.csv` is intentionally empty in this starter because no real dataset was supplied. Do not put invented medical prices into it.

Required columns:
```text
treatment,location,estimated_cost,cost_min,cost_max
```

## Testing

```bash
pytest -q
```

## Security

- Passwords are hashed with Argon2 through `pwdlib`.
- JWT secrets come from environment configuration.
- Policy ownership is checked on every policy/analysis operation.
- Only PDFs are accepted.
- Upload size is limited.
- Files are stored under a generated UUID filename rather than the client filename.
- Internal filesystem paths are never returned by API endpoints.
- `.env`, database files and policy storage are ignored by Git.

## Frontend integration

The frontend can use the exact contracts in `BACKEND_API_CONTRACT.md`. No React code is included here and endpoint names should not be changed casually because the frontend is developed independently.
