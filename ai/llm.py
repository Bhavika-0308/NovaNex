import os
import re
import json
from typing import List, Dict, Any, Tuple
from ai.config import AIConfig
from ai.prompt import SYSTEM_PROMPT, format_rag_prompt
from ai.schemas import QueryResult, Citation

class LLMService:
    """Configurable LLM Service supporting Gemini, OpenAI, Anthropic, Ollama, and deterministic RAG synthesis."""

    def __init__(self):
        self.provider = AIConfig.LLM_PROVIDER
        self.gemini_key = AIConfig.GEMINI_API_KEY
        self.openai_key = AIConfig.OPENAI_API_KEY
        self.anthropic_key = AIConfig.ANTHROPIC_API_KEY

    def generate_answer(self, question: str, context_results: List[QueryResult]) -> Tuple[str, List[str]]:
        """
        Generate answer and extract missing information topics.
        Returns: (answer_string, list_of_missing_information_topics)
        """
        if not context_results:
            missing_msg = "The policy document has not been uploaded or contains no relevant sections."
            ans = f"I couldn't find sufficient information about this in the uploaded policy. {missing_msg}"
            return ans, ["Uploaded Policy Context"]

        # Check max similarity score
        max_sim = max((res.similarity_score for res in context_results), default=0.0)
        if max_sim < AIConfig.SIMILARITY_THRESHOLD:
            ans = f"I couldn't find sufficient information about '{question}' in the uploaded policy document."
            return ans, [question]

        user_prompt = format_rag_prompt(question, context_results)

        # Try Gemini API if key is present or requested
        if (self.provider in ["gemini", "auto"]) and self.gemini_key:
            res = self._call_gemini(user_prompt)
            if res:
                return self._parse_llm_output(res, question)

        # Try OpenAI API if key present
        if (self.provider in ["openai", "auto"]) and self.openai_key:
            res = self._call_openai(user_prompt)
            if res:
                return self._parse_llm_output(res, question)

        # Try Anthropic API if key present
        if (self.provider in ["anthropic", "auto"]) and self.anthropic_key:
            res = self._call_anthropic(user_prompt)
            if res:
                return self._parse_llm_output(res, question)

        # Fallback to local deterministic RAG answer synthesizer
        return self._synthesize_rag_response(question, context_results)

    def _call_gemini(self, prompt: str) -> str:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=SYSTEM_PROMPT)
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"[LLMService] Gemini API call error: {str(e)}")
            return ""

    def _call_openai(self, prompt: str) -> str:
        try:
            import openai
            client = openai.OpenAI(api_key=self.openai_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"[LLMService] OpenAI API call error: {str(e)}")
            return ""

    def _call_anthropic(self, prompt: str) -> str:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.anthropic_key)
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000
            )
            return response.content[0].text
        except Exception as e:
            print(f"[LLMService] Anthropic API call error: {str(e)}")
            return ""

    def _synthesize_rag_response(self, question: str, context_results: List[QueryResult]) -> Tuple[str, List[str]]:
        """
        Deterministic, rule-bound RAG Response Synthesizer.
        Used when external API keys are unavailable or for offline testing.
        Extracts facts strictly from context chunks without hallucinating.
        """
        q_lower = question.lower()
        matching_sentences = []
        missing_info = []

        # Extract meaningful query keywords (filtering standard stop words)
        stopwords = {'what', 'does', 'this', 'have', 'from', 'with', 'about', 'is', 'my', 'the', 'for', 'in', 'of', 'are', 'a', 'an'}
        keywords = [w for w in re.findall(r'\w+', q_lower) if len(w) >= 3 and w not in stopwords]

        # Check if critical specific query terms are completely missing from the entire context
        context_full_text = " ".join([res.chunk.text.lower() for res in context_results])
        missing_keywords = [kw for kw in keywords if kw not in context_full_text]

        # If key terms like 'cheapest', 'pune', etc. are missing from context
        if missing_keywords and len(missing_keywords) >= (len(keywords) / 2):
            ans = f"I couldn't find sufficient information about '{question}' in the uploaded policy."
            return ans, [f"Policy details regarding {', '.join(missing_keywords)}"]

        found_support = False
        chunks_used = []

        for res in context_results:
            text = res.chunk.text
            meta = res.chunk.metadata
            page = meta.page
            section = meta.section or "Policy Terms"

            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 15]

            for s in sentences:
                s_lower = s.lower()
                matches = sum(1 for kw in keywords if kw in s_lower)
                # Require relevant match or coverage keyword
                if matches >= 1:
                    matching_sentences.append(f"{s} [Page {page}, Section: {section}]")
                    found_support = True
                    if (page, section) not in chunks_used:
                        chunks_used.append((page, section))

        if not found_support:
            ans = f"I couldn't find sufficient information about '{question}' in the uploaded policy."
            missing_info.append("Specific policy clause matching query terms")
            return ans, missing_info


        ans_intro = f"According to the uploaded policy document, the following details pertain to '{question}':\n\n"
        ans_body = "\n\n".join(matching_sentences[:5])
        
        full_answer = ans_intro + ans_body

        # Check for missing specifics
        if "room" in q_lower and not any("room" in s.lower() for s in matching_sentences):
            missing_info.append("Room category tariff cap details")
        if "pre-existing" in q_lower or "waiting" in q_lower:
            if not any("month" in s.lower() or "year" in s.lower() for s in matching_sentences):
                missing_info.append("Exact waiting period duration in months/years")

        return full_answer, missing_info

    def _parse_llm_output(self, text: str, question: str) -> Tuple[str, List[str]]:
        missing_info = []
        if "couldn't find sufficient information" in text.lower() or "not available in the policy" in text.lower():
            missing_info.append("Policy clause for requested topic")
        return text, missing_info
