import os
import re
from typing import List, Dict, Any, Optional
from pathlib import Path

class DocumentProcessingError(Exception):
    """Exception raised for errors during document extraction."""
    pass

class ExtractedPage:
    def __init__(self, page_num: int, text: str, initial_section: Optional[str] = None):
        self.page_num = page_num
        self.text = text
        self.initial_section = initial_section

class DocumentProcessor:
    """Extracts text and page metadata from insurance policy PDFs."""

    SECTION_HEADER_PATTERNS = [
        re.compile(r'^(SECTION\s+\d+[\.\d+]*\b.*?)$', re.IGNORECASE | re.MULTILINE),
        re.compile(r'^(CLAUSE\s+\d+[\.\d+]*\b.*?)$', re.IGNORECASE | re.MULTILINE),
        re.compile(r'^(\d+\.\s+[A-Z\s]{4,50})$', re.MULTILINE),
        re.compile(r'^([A-Z\s]{5,60}:?)$', re.MULTILINE),
        re.compile(r'^(COVERAGE|EXCLUSIONS|WAITING PERIODS|DEFINITIONS|GENERAL CONDITIONS|CLAIM PROCEDURE|POLICY SCHEDULE)\b.*$', re.IGNORECASE | re.MULTILINE)
    ]

    def __init__(self):
        self._fitz = None
        self._pdfplumber = None
        self._pypdf = None
        self._detect_pdf_libraries()

    def _detect_pdf_libraries(self):
        """Try importing available PDF libraries in order of preference."""
        try:
            import fitz  # PyMuPDF
            self._fitz = fitz
            return
        except ImportError:
            pass

        try:
            import pdfplumber
            self._pdfplumber = pdfplumber
            return
        except ImportError:
            pass

        try:
            import pypdf
            self._pypdf = pypdf
            return
        except ImportError:
            pass

    def extract_pdf(self, document_path: str) -> List[ExtractedPage]:
        """
        Extract text page by page from a PDF file.
        Preserves 1-indexed page numbers and identifies initial sections.
        """
        file_path = Path(document_path)
        if not file_path.exists():
            raise DocumentProcessingError(f"File not found: {document_path}")
        
        if file_path.stat().st_size == 0:
            raise DocumentProcessingError(f"PDF file is empty (0 bytes): {document_path}")

        extracted_pages: List[ExtractedPage] = []

        if self._fitz:
            extracted_pages = self._extract_fitz(file_path)
        elif self._pdfplumber:
            extracted_pages = self._extract_pdfplumber(file_path)
        elif self._pypdf:
            extracted_pages = self._extract_pypdf(file_path)
        else:
            # Fallback pure python PDF text reader if standard libraries not yet installed
            extracted_pages = self._extract_basic(file_path)

        if not extracted_pages:
            raise DocumentProcessingError("No pages could be extracted from PDF.")

        total_text_len = sum(len(page.text.strip()) for page in extracted_pages)
        if total_text_len < 30:
            raise DocumentProcessingError(
                "Scanned or image-only PDF detected with no extractable text. OCR pre-processing is required for image-based PDFs."
            )

        return extracted_pages

    def _extract_fitz(self, file_path: Path) -> List[ExtractedPage]:
        pages = []
        try:
            doc = self._fitz.open(str(file_path))
            current_section = "General Policy Details"
            for i, page in enumerate(doc):
                page_text = page.get_text("text") or ""
                detected = self._find_first_section_heading(page_text)
                if detected:
                    current_section = detected
                pages.append(ExtractedPage(page_num=i + 1, text=page_text, initial_section=current_section))
            doc.close()
        except Exception as e:
            raise DocumentProcessingError(f"Failed to extract text with PyMuPDF: {str(e)}")
        return pages

    def _extract_pdfplumber(self, file_path: Path) -> List[ExtractedPage]:
        pages = []
        try:
            with self._pdfplumber.open(str(file_path)) as pdf:
                current_section = "General Policy Details"
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text() or ""
                    detected = self._find_first_section_heading(page_text)
                    if detected:
                        current_section = detected
                    pages.append(ExtractedPage(page_num=i + 1, text=page_text, initial_section=current_section))
        except Exception as e:
            raise DocumentProcessingError(f"Failed to extract text with pdfplumber: {str(e)}")
        return pages

    def _extract_pypdf(self, file_path: Path) -> List[ExtractedPage]:
        pages = []
        try:
            reader = self._pypdf.PdfReader(str(file_path))
            current_section = "General Policy Details"
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                detected = self._find_first_section_heading(page_text)
                if detected:
                    current_section = detected
                pages.append(ExtractedPage(page_num=i + 1, text=page_text, initial_section=current_section))
        except Exception as e:
            raise DocumentProcessingError(f"Failed to extract text with pypdf: {str(e)}")
        return pages

    def _extract_basic(self, file_path: Path) -> List[ExtractedPage]:
        """Fallback basic text parser if binary PDF stream has raw text streams."""
        try:
            content = file_path.read_bytes()
            text_chunks = re.findall(rb'\((.*?)\)\s*TJ|\((.*?)\)\s*Tj', content)
            raw_strings = []
            for match in text_chunks:
                s = match[0] or match[1]
                try:
                    raw_strings.append(s.decode('utf-8', errors='ignore'))
                except Exception:
                    pass
            combined = " ".join(raw_strings)
            return [ExtractedPage(page_num=1, text=combined, initial_section="Policy Document")]
        except Exception as e:
            raise DocumentProcessingError(f"Basic PDF text extraction failed: {str(e)}")

    def _find_first_section_heading(self, text: str) -> Optional[str]:
        for pattern in self.SECTION_HEADER_PATTERNS:
            match = pattern.search(text)
            if match:
                clean = match.group(1).strip()
                if 4 <= len(clean) <= 80:
                    return clean
        return None
