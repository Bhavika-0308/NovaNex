# PolicyWise AI Module

This directory contains the AI Policy Assistant and RAG pipeline for PolicyWise.

Please refer to the root documentation file [`AI_MODULE_README.md`](../AI_MODULE_README.md) for full setup, API schemas, and integration details.

### Quick Start:

```python
from ai import ingest_policy, ask_policy_question

# Ingest policy
ingest_policy("POL_123", "/path/to/policy.pdf")

# Ask question
response = ask_policy_question("POL_123", "Is room rent covered?")
print(response.answer)
print(response.citations)
print(response.confidence)
```

### Run Tests:
```bash
python -m ai.tests.test_rag
```
