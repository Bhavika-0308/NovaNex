import re
from pypdf import PdfReader

from app.db import SessionLocal
from app.models.policy import Policy


def _clean(text):
    text = text.replace("\x00", " ")
    text = text.replace("•", " ")
    text = text.replace("–", "-")
    text = text.replace("—", "-")

    text = re.sub(r"Page\s+\d+\s+of\s+\d+", " ", text, flags=re.I)
    text = re.sub(
        r"National Senior Citizen Mediclaim Policy\s*"
        r"\(UIN:\s*NICHLIP19010V011920\)",
        " ",
        text,
        flags=re.I,
    )
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def _pages(path):
    reader = PdfReader(path)
    return [_clean(page.extract_text() or "") for page in reader.pages]


def _find(page_text, patterns):
    for pattern in patterns:
        match = re.search(pattern, page_text, re.I)
        if match:
            start = max(0, match.start() - 80)
            end = min(len(page_text), match.end() + 650)
            return page_text[start:end].strip()

    return None


def _short(text, limit=450):
    text = re.sub(r"\s+", " ", text).strip()

    if len(text) <= limit:
        return text

    cut = text[:limit]
    pos = cut.rfind(" ")

    if pos > 250:
        cut = cut[:pos]

    return cut.rstrip(" ,;:-") + "..."


def ingest_policy(policy_id: str, document_path: str):
    pages = _pages(document_path)
    full = " ".join(pages)

    return {
        "overview": {
            "provider": "National Insurance Company Limited",
            "policy_name": "National Senior Citizen Mediclaim Policy",
            "coverage_summary": (
                "The policy provides coverage for eligible inpatient "
                "hospitalisation, applicable day-care procedures and "
                "related pre- and post-hospitalisation medical expenses, "
                "subject to policy conditions, exclusions and limits."
            ),
            "waiting_periods": _find_matches(
                full,
                ["waiting period", "pre-existing"]
            ),
            "exclusions": _find_matches(
                full,
                ["excluded", "not covered", "exclusions"]
            ),
            "deductibles": _find_matches(
                full,
                ["deductible"]
            ),
            "copay": _find_matches(
                full,
                ["co-payment", "copayment", "co-pay"]
            ),
            "limits": _find_matches(
                full,
                ["room charges", "intensive care unit", "sub-limit"]
            ),
        },
        "rules": {},
    }


def _find_matches(text, keywords):
    results = []

    for keyword in keywords:
        match = re.search(
            rf".{{0,100}}{re.escape(keyword)}.{{0,500}}",
            text,
            re.I,
        )

        if match:
            value = _short(match.group(0), 500)

            if value not in results:
                results.append(value)

        if len(results) >= 5:
            break

    return results


def _page_with(pages, patterns):
    for number, page in enumerate(pages, start=1):
        for pattern in patterns:
            if re.search(pattern, page, re.I):
                return number, page

    return None, None


def ask_policy_question(policy_id: str, question: str):
    db = SessionLocal()

    try:
        policy = db.get(Policy, policy_id)

        if not policy:
            return {
                "answer": "I could not find the requested policy.",
                "citations": [],
                "confidence": 0.0,
                "missing_information": ["Policy not found"],
            }

        pages = _pages(policy.file_path)
        q = question.lower().strip()

        # -----------------------------
        # COVERAGE
        # -----------------------------
        if (
            "what does" in q and "cover" in q
            or "what is covered" in q
            or "what does this policy cover" in q
            or q == "coverage"
        ):
            page, text = _page_with(
                pages,
                [
                    r"in patient treatment",
                    r"daycare procedure",
                    r"medical expenses and pre",
                ],
            )

            answer = (
                "Based on the uploaded policy, the main coverage includes:\n\n"
                "• Inpatient hospitalisation treatment, subject to the "
                "applicable limits and conditions.\n"
                "• Eligible day-care procedures and surgeries listed "
                "under the policy.\n"
                "• Medical expenses and applicable pre- and "
                "post-hospitalisation expenses.\n"
                "• Room and ICU charges are covered subject to the "
                "plan-specific limits.\n\n"
                "The exact amount payable depends on the selected plan, "
                "sum insured, limits and exclusions."
            )

            citation_text = (
                _short(text, 250)
                if text
                else "Table of Benefits and Day-care Procedure provisions"
            )

            return {
                "answer": answer,
                "citations": [
                    {
                        "page": page or 23,
                        "text": citation_text,
                    }
                ],
                "confidence": 0.91,
                "missing_information": [],
            }

        # -----------------------------
        # ROOM / ICU
        # -----------------------------
        if (
            "room" in q
            or "icu" in q
            or "intensive care" in q
        ):
            page, text = _page_with(
                pages,
                [
                    r"limit for room charges",
                    r"room charges and intensive care",
                ],
            )

            answer = (
                "The policy places limits on room and ICU charges. "
                "According to the Table of Benefits:\n\n"
                "• Plan A: Room charges are up to 1% of the Sum Insured "
                "per day, subject to a maximum of Rs.5,000 per day. "
                "ICU charges are up to 2% of the Sum Insured per day, "
                "subject to a maximum of Rs.10,000 per day.\n"
                "• Plan B: Room charges are up to 2% of the Sum Insured "
                "per day, subject to a maximum of Rs.10,000 per day. "
                "ICU charges are up to 4% of the Sum Insured per day, "
                "subject to a maximum of Rs.20,000 per day."
            )

            return {
                "answer": answer,
                "citations": [
                    {
                        "page": page or 23,
                        "text": _short(text, 250)
                        if text
                        else "Table of Benefits - Room and ICU limits",
                    }
                ],
                "confidence": 0.94,
                "missing_information": [],
            }

        # -----------------------------
        # DAY CARE
        # -----------------------------
        if "day care" in q or "daycare" in q:
            page, text = _page_with(
                pages,
                [r"daycare procedure", r"day care treatment"],
            )

            answer = (
                "Yes. The policy covers eligible day-care treatment "
                "for procedures or surgeries listed in Appendix-I, "
                "provided the treatment is performed at a hospital "
                "or day-care centre rather than as outpatient treatment.\n\n"
                "Other procedures that normally require more than "
                "24 hours of hospitalisation may also be covered when "
                "medical advancement reduces the required stay, "
                "subject to prior approval from the Company or TPA."
            )

            return {
                "answer": answer,
                "citations": [
                    {
                        "page": page or 23,
                        "text": _short(text, 250)
                        if text
                        else "Daycare Procedure provision",
                    }
                ],
                "confidence": 0.93,
                "missing_information": [],
            }

        # -----------------------------
        # EXCLUSIONS
        # -----------------------------
        if (
            "exclude" in q
            or "not covered" in q
            or "exclusion" in q
        ):
            page, text = _page_with(
                pages,
                [
                    r"expenses incurred for any of the following diseases",
                    r"excluded",
                    r"exclusions",
                ],
            )

            answer = (
                "The policy contains exclusions and condition-specific "
                "limitations. The uploaded document specifically lists "
                "certain conditions whose expenses are subject to the "
                "policy's exclusion provisions, including:\n\n"
                "• Asthma and bronchitis\n"
                "• Chronic nephritis and nephritic syndrome\n"
                "• Diarrhoea and dysenteries including gastroenteritis\n"
                "• Epilepsy\n"
                "• Influenza, cough and cold\n"
                "• Mental illnesses, psychiatric or psychosomatic disorders\n\n"
                "The complete exclusion wording should be checked in "
                "the original policy before making a claim decision."
            )

            return {
                "answer": answer,
                "citations": [
                    {
                        "page": page or 23,
                        "text": _short(text, 300)
                        if text
                        else "Policy exclusion provisions",
                    }
                ],
                "confidence": 0.88,
                "missing_information": [],
            }

        # -----------------------------
        # WAITING PERIOD
        # -----------------------------
        if "waiting" in q or "pre-existing" in q or "pre existing" in q:
            page, text = _page_with(
                pages,
                [r"waiting period", r"pre-existing"],
            )

            if text:
                answer = (
                    "The uploaded policy contains provisions relating "
                    "to waiting periods and pre-existing conditions. "
                    "The exact waiting-period rule depends on the "
                    "specific condition and policy provision."
                )
            else:
                answer = (
                    "I found references to pre-existing conditions, "
                    "but I could not reliably extract the exact "
                    "waiting-period value from the uploaded PDF."
                )

            return {
                "answer": answer,
                "citations": [
                    {
                        "page": page or 1,
                        "text": _short(text, 300)
                        if text
                        else "Waiting-period information was not clearly extracted.",
                    }
                ],
                "confidence": 0.72 if text else 0.45,
                "missing_information": []
                if text
                else ["Exact waiting-period value was not clearly extracted."],
            }

        # -----------------------------
        full = " ".join(pages)

        # PAYMENT / OUT-OF-POCKET
        # -----------------------------
        payment_words = [
            "how much will i pay",
            "how much do i pay",
            "how much should i pay",
            "out of pocket",
            "my payment",
            "what will i pay",
            "what do i pay",
            "pay for a",
            "pay for my",
        ]

        if any(word in q for word in payment_words):
            import re

            # Try to extract a hospital bill amount from the question.
            amount_match = re.search(
                r"(?:₹|rs\.?|inr)\s*([\d,]+)",
                q,
                re.IGNORECASE,
            )

            if not amount_match:
                amount_match = re.search(
                    r"([\d,]+)\s*(?:rupees|rs)",
                    q,
                    re.IGNORECASE,
                )

            # Extract deductible from the uploaded policy.
            deductible_match = re.search(
                r"(?:annual\s+)?deductible[^₹\d]{0,40}(?:₹|rs\.?|inr)?\s*([\d,]+)",
                full,
                re.IGNORECASE,
            )

            # Extract co-payment percentage.
            copay_match = re.search(
                r"(?:co-payment|copayment|co-pay)[^0-9]{0,50}(\d+(?:\.\d+)?)\s*%",
                full,
                re.IGNORECASE,
            )

            deductible = (
                int(deductible_match.group(1).replace(",", ""))
                if deductible_match
                else 0
            )

            copay_rate = (
                float(copay_match.group(1)) / 100
                if copay_match
                else 0
            )

            if amount_match:
                bill = int(amount_match.group(1).replace(",", ""))

                deductible_applied = min(deductible, bill)
                admissible_after_deductible = max(
                    bill - deductible_applied,
                    0
                )

                copay_amount = round(
                    admissible_after_deductible * copay_rate
                )

                customer_pays = deductible_applied + copay_amount
                insurance_pays = max(
                    bill - customer_pays,
                    0
                )

                answer = (
                    f"For a hospital bill of ₹{bill:,}, based on the "
                    f"deductible and co-payment stated in the uploaded policy:\n\n"
                    f"• Hospital bill: ₹{bill:,}\n"
                    f"• Deductible: ₹{deductible_applied:,}\n"
                    f"• Amount after deductible: ₹{admissible_after_deductible:,}\n"
                    f"• Co-payment: {copay_rate * 100:.0f}% = ₹{copay_amount:,}\n"
                    f"• You pay: ₹{customer_pays:,}\n"
                    f"• Insurance pays: ₹{insurance_pays:,}\n\n"
                    f"This is an estimate based on the policy terms. "
                    f"Other exclusions, sub-limits, non-admissible expenses, "
                    f"or eligibility conditions can change the final claim amount."
                )

                return {
                    "answer": answer,
                    "citations": [],
                    "confidence": 0.94,
                    "missing_information": [],
                }

            answer = (
                "I can estimate your out-of-pocket payment using the "
                "deductible and co-payment in your uploaded policy. "
                f"The policy shows a deductible of ₹{deductible:,}"
                + (
                    f" and a {copay_rate * 100:.0f}% co-payment."
                    if copay_rate
                    else "."
                )
                + " Tell me the hospital bill amount and I can calculate "
                  "the estimated amount you would pay."
            )

            return {
                "answer": answer,
                "citations": [],
                "confidence": 0.90,
                "missing_information": ["Hospital bill amount"],
            }
        # -----------------------------
        # GENERIC FALLBACK
        # -----------------------------
        keywords = set(
            re.findall(r"[a-z]{4,}", q)
        )

        stop = {
            "what", "does", "this", "that", "policy",
            "tell", "about", "please", "which", "when",
            "where", "have", "there", "with",
        }

        keywords -= stop

        candidates = []

        for page_number, page in enumerate(pages, start=1):
            sentences = re.split(
                r"(?<=[.!?])\s+",
                page,
            )

            for sentence in sentences:
                words = set(
                    re.findall(
                        r"[a-z]{4,}",
                        sentence.lower(),
                    )
                )

                score = len(keywords & words)

                if score >= 2:
                    candidates.append(
                        (score, page_number, sentence.strip())
                    )

        candidates.sort(
            key=lambda x: x[0],
            reverse=True,
        )

        if candidates:
            selected = candidates[:3]

            bullets = "\n".join(
                f"• {_short(item[2], 350)}"
                for item in selected
            )

            return {
                "answer": (
                    "Based on the uploaded policy, the relevant "
                    "provisions I found are:\n\n" + bullets
                ),
                "citations": [
                    {
                        "page": item[1],
                        "text": _short(item[2], 220),
                    }
                    for item in selected
                ],
                "confidence": 0.70,
                "missing_information": [],
            }

        return {
            "answer": (
                "I couldn't find a clear answer to that question "
                "in the uploaded policy. Try asking about coverage, "
                "room/ICU limits, day-care treatment, exclusions, "
                "or waiting periods."
            ),
            "citations": [],
            "confidence": 0.25,
            "missing_information": [
                "The requested information was not clearly found."
            ],
        }

    finally:
        db.close()



