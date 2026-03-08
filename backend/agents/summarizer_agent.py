from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class SummarizerAgent:

    def run(self, paper_data, is_raw_text=False):
        """
        paper_data: dict with 'title', 'summary' (abstract), 'authors' (list)
        If is_raw_text is True, paper_data is just the full text of the PDF.
        """
        if is_raw_text:
            content_to_analyze = f"Full Paper Text:\n{paper_data[:10000]}" # Truncate for token limits
            context_desc = "the following research paper text"
        else:
            content_to_analyze = f"Title: {paper_data.get('title')}\nAbstract: {paper_data.get('summary')}"
            context_desc = "the following research paper abstract"

        prompt = f"""
        Summarize {context_desc} into a structured JSON format.
        
        The JSON MUST have exactly these keys:
        - "title": (string)
        - "authors": (list of strings)
        - "methodology": (string, 1-2 sentences)
        - "key_findings": (list of 3-5 strings)
        - "summary": (string, concise overview)

        Return ONLY the JSON. No other text.

        Content:
        {content_to_analyze}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            temperature=0.1,
            max_tokens=800,
            response_format={"type": "json_object"},
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        try:
            result = json.loads(response.choices[0].message.content)
            # Ensure authors is present if we have them in input but LLM missed it
            if not result.get("authors") and not is_raw_text:
                result["authors"] = paper_data.get("authors", [])
            return result
        except Exception as e:
            return {
                "title": paper_data.get("title", "Unknown"),
                "authors": paper_data.get("authors", []),
                "methodology": "Error parsing methodology",
                "key_findings": [],
                "summary": "Error generating summary",
                "error": str(e)
            }