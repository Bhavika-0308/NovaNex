# PolicyWise Backend API Contract

Base URL: `/`
Authentication: `Authorization: Bearer <JWT>` where AUTH REQUIRED is `YES`.

All errors use:
```json
{"error":{"code":"ERROR_CODE","message":"Human readable message"}}
```

## Authentication

### POST `/api/auth/signup`
- AUTH REQUIRED: NO
- Request:
```json
{"email":"user@example.com","password":"minimum-8-chars","full_name":"Akanksha"}
```
- Response `201`:
```json
{"id":"uuid","email":"user@example.com","full_name":"Akanksha"}
```
- Errors: `EMAIL_EXISTS`, `VALIDATION_ERROR`

### POST `/api/auth/login`
- AUTH REQUIRED: NO
- Request:
```json
{"email":"user@example.com","password":"minimum-8-chars"}
```
- Response `200`:
```json
{"access_token":"jwt","token_type":"bearer"}
```
- Errors: `INVALID_CREDENTIALS`, `VALIDATION_ERROR`

### GET `/api/auth/me`
- AUTH REQUIRED: YES
- Response `200`:
```json
{"id":"uuid","email":"user@example.com","full_name":"Akanksha"}
```
- Errors: `UNAUTHORIZED`

## Users

### GET `/api/users/me`
- AUTH REQUIRED: YES
- Request body: none
- Response: same user object as `/api/auth/me`
- Errors: `UNAUTHORIZED`

## Policies

### POST `/api/policies/upload`
- AUTH REQUIRED: YES
- Content-Type: `multipart/form-data`
- Form field: `file` (PDF only, max configured by `MAX_UPLOAD_SIZE_MB`, default 10 MB)
- Response `202`:
```json
{"policy_id":"uuid","filename":"policy.pdf","status":"processing"}
```
- Errors: `UNAUTHORIZED`, `INVALID_PDF`, `FILE_TOO_LARGE`

### GET `/api/policies/{policy_id}/status`
- AUTH REQUIRED: YES
- Request body: none
- Response `200`:
```json
{"policy_id":"uuid","status":"processing|completed|failed"}
```
- Errors: `UNAUTHORIZED`, `POLICY_NOT_FOUND`

### GET `/api/policies/{policy_id}`
- AUTH REQUIRED: YES
- Request body: none
- Response `200`:
```json
{
  "policy_id":"uuid",
  "provider":null,
  "policy_name":null,
  "coverage_summary":null,
  "waiting_periods":[],
  "exclusions":[],
  "deductibles":[],
  "copay":[],
  "limits":[]
}
```
Fields are populated from processed document/AI data; no fake policy data is inserted.
- Errors: `UNAUTHORIZED`, `POLICY_NOT_FOUND`

## AI Assistant

### POST `/api/assistant/ask`
- AUTH REQUIRED: YES
- Request:
```json
{"policy_id":"uuid","question":"Is knee replacement covered?"}
```
- Response `200`:
```json
{"answer":"...","citations":[{"text":"...","page":1,"section":"..."}],"confidence":0.0,"missing_information":[]}
```
- Errors: `UNAUTHORIZED`, `POLICY_NOT_FOUND`, `AI_NOT_CONFIGURED`, `AI_INVALID_RESPONSE`

## Cost Analyzer

### POST `/api/cost/analyze`
- AUTH REQUIRED: YES
- Request:
```json
{"treatment":"Knee Replacement","age":45,"location":"Pune"}
```
- Response `200`:
```json
{"treatment":"Knee Replacement","location":"Pune","estimated_cost":250000,"cost_min":200000,"cost_max":300000,"source":"cost_dataset"}
```
- Errors: `UNAUTHORIZED`, `COST_DATA_UNAVAILABLE`, `COST_NOT_FOUND`, `INVALID_COST_DATASET`

## Coverage Analysis

### POST `/api/coverage/analyze`
- AUTH REQUIRED: YES
- Request:
```json
{
  "policy_id":"uuid",
  "treatment":"Knee Replacement",
  "treatment_cost":250000,
  "patient_details":{"age":45,"location":"Pune"}
}
```
- Response `200`:
```json
{
  "analysis_id":"uuid",
  "estimated_cost":250000,
  "potential_coverage":180000,
  "potential_oop":70000,
  "confidence":0.82,
  "reasons":[],
  "missing_information":[]
}
```
Coverage values are potential/estimated values derived from processed policy rules. They are not guarantees of insurer payment.
- Errors: `UNAUTHORIZED`, `POLICY_NOT_FOUND`

### POST `/api/coverage/recalculate`
- AUTH REQUIRED: YES
- Request:
```json
{"analysis_id":"uuid","additional_information":{"hospital_type":"private","network_status":"network"}}
```
- Response: same coverage response shape as `/api/coverage/analyze`
- Errors: `UNAUTHORIZED`, `ANALYSIS_NOT_FOUND`

## Reports

### GET `/api/reports/{analysis_id}`
- AUTH REQUIRED: YES
- Request body: none
- Response `200`:
```json
{
  "policy_summary":"...",
  "treatment":"Knee Replacement",
  "estimated_cost":250000,
  "potential_coverage":180000,
  "potential_oop":70000,
  "confidence":0.82,
  "reasons":[],
  "citations":[]
}
```
- Errors: `UNAUTHORIZED`, `ANALYSIS_NOT_FOUND`

## Frontend integration notes

1. Signup/login first.
2. Store the JWT securely on the frontend and send `Authorization: Bearer <token>` on protected requests.
3. Upload a PDF to `/api/policies/upload` as multipart field `file`.
4. Poll `/api/policies/{policy_id}/status` until `completed` or `failed`.
5. Fetch `/api/policies/{policy_id}` for overview.
6. Use `/api/assistant/ask` for the AI assistant.
7. Use `/api/cost/analyze` for dataset-backed cost estimates.
8. Use `/api/coverage/analyze`, then `/api/coverage/recalculate` when the backend reports missing information.
9. Fetch `/api/reports/{analysis_id}` for the final report.

## Health

### GET `/health`
- AUTH REQUIRED: NO
- Request body: none
- Response `200`:
```json
{"status":"ok"}
```
