import json
from pathlib import Path
import fitz
from fastapi import HTTPException

class DocumentService:
    def validate_pdf(self, content: bytes, filename: str):
        if not filename.lower().endswith(".pdf") or not content.startswith(b"%PDF"):
            raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_PDF", "message": "Only valid PDF files are accepted"}})
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            if doc.page_count == 0:
                raise ValueError("empty PDF")
            doc.close()
        except Exception as exc:
            raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_PDF", "message": "The uploaded file is not a readable PDF"}}) from exc

    def extract(self, path: str):
        doc = fitz.open(path)
        pages = []
        for number, page in enumerate(doc, start=1):
            text = page.get_text("text") or ""
            pages.append({"page": number, "text": text})
        doc.close()
        return pages, "\n\n".join(p["text"] for p in pages)

document_service = DocumentService()
