import os
import uvicorn
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ai.router import ai_router
from ai.rag_service import get_rag_service
from ai.chunker import SmartPolicyChunker
from ai.document_processor import ExtractedPage

app = FastAPI(
    title="PolicyWise API Backend",
    description="AI-Powered Health Insurance Policy Analyzer Backend",
    version="1.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include AI Module Router
app.include_router(ai_router)

DEFAULT_POLICY_ID = "HP-458732"

SAMPLE_POLICY_TEXT = """
COMPREHENSIVE HEALTH INSURANCE POLICY SCHEDULE
Policy Number: HP-458732
Insured Product: Health Guard Advanced Care
Sum Insured: Rs. 5,00,000

SECTION 1: HOSPITALIZATION & ROOM RENT COVERAGE
1.1 Inpatient Hospitalization: The company will cover room rent, nursing care, ICU charges, surgeon fees, operating theatre expenses, and diagnostic tests for hospital stay exceeding 24 hours.
1.2 Room Rent Sub-Limit: Room rent is covered up to Single Private Room limit (Rs. 5,000 per day). If the insured occupies a higher category room (such as a Suite), a proportionate co-payment of 20% shall apply on all associated hospital bill categories.
1.3 ICU Charges: Intensive Care Unit (ICU) charges are covered up to Rs. 10,000 per day or actuals, whichever is lower.

SECTION 2: SURGICAL PROCEDURES & SPECIFIC TREATMENTS
2.1 Knee Replacement Surgery: Robotic and conventional knee replacement surgery is covered subject to a specific waiting period of 24 months. Total claim payout is subject to a sub-limit of 50% of sum insured or Rs. 3,00,000, whichever is lower.
2.2 Cataract Surgery: Covered up to a sub-limit of Rs. 40,000 per eye.
2.3 Appendectomy & Laparoscopic Surgeries: Fully covered up to sum insured after 30 days initial waiting period.

SECTION 3: WAITING PERIODS & PRE-EXISTING DISEASES
3.1 Pre-Existing Diseases (PED): A mandatory waiting period of 36 months of continuous coverage applies for pre-existing medical conditions (including Diabetes, Hypertension, and Cardiac ailments).
3.2 Initial Waiting Period: A 30-day waiting period applies from policy start date for all illnesses, excluding accidental injuries.

SECTION 4: EXCLUSIONS & NON-MEDICAL EXPENSES
4.1 Excluded Expenses: Consumables, disposable gloves, PPE kits, admission fees, syringe disposal, and administrative charges are strictly excluded under Section 4.2 (Non-Medical Expenses) and must be paid out-of-pocket.
4.2 Cosmetic & Aesthetic Treatments: Aesthetic surgeries, obesity management, and plastic surgery are excluded unless required for trauma reconstruction.
4.3 Maternity Coverage: Maternity expenses are covered up to Rs. 50,000 after a 24-month waiting period.

SECTION 5: CO-PAYMENT & DEDUCTIBLES
5.1 Senior Citizen Co-Pay: A 10% co-payment applies for insured members aged 60 and above across all claims.
5.2 Network Hospitals: Cashless facility is available at 8,500+ empanelled network hospitals. Reimbursement claims at non-network hospitals are subject to 15% co-pay.
"""

def seed_default_policy():
    """Seed default policy HP-458732 into isolated vector store on startup."""
    try:
        service = get_rag_service()
        if not service.vector_store.policy_exists(DEFAULT_POLICY_ID):
            print(f"[PolicyWise API] Ingesting default policy '{DEFAULT_POLICY_ID}'...")
            chunker = SmartPolicyChunker()
            pages = [ExtractedPage(page_num=1, text=SAMPLE_POLICY_TEXT, initial_section="POLICY SCHEDULE")]
            chunks = chunker.chunk_policy(DEFAULT_POLICY_ID, pages)
            embeddings = service.embedder.embed_texts([c.text for c in chunks])
            service.vector_store.add_policy(DEFAULT_POLICY_ID, chunks, embeddings)
            print(f"[PolicyWise API] Default policy '{DEFAULT_POLICY_ID}' successfully indexed!")
    except Exception as e:
        print(f"[PolicyWise API] Failed to seed default policy: {str(e)}")

@app.on_event("startup")
def startup_event():
    seed_default_policy()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "PolicyWise AI Backend",
        "default_policy_id": DEFAULT_POLICY_ID,
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
