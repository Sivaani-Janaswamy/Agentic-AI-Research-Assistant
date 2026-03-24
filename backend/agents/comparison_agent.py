from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ComparisonAgent:
    def run(self, papers):
        """
        papers: list of dicts with keys: id, title, summary (abstract)
        """
        combined_text = ""
        for p in papers:
            summary = p.get("summary") or "No abstract provided."
            combined_text += f"ID: {p.get('id')}\nTitle: {p.get('title')}\nAbstract: {summary}\n---\n"

        prompt = f"""
Compare the following research papers and extract key metrics into a structured JSON matrix.

Rules:
- If a metric is not mentioned, fill it with "Not specified" (do NOT leave empty and do NOT use N/A).
- Keep values concise but specific when available.

Return JSON with one key "papers": a list of objects, each having exactly:
- "id": string (as provided)
- "title": string
- "accuracy": string
- "speed": string
- "dataset": string
- "hardware": string

Return ONLY the JSON.

Papers:
{combined_text}
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            temperature=0.1,
            max_tokens=1000,
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            parsed = json.loads(response.choices[0].message.content)
            for p in parsed.get("papers", []):
                for k in ["accuracy", "speed", "dataset", "hardware"]:
                    if not p.get(k) or str(p.get(k)).strip() == "":
                        p[k] = "Not specified"
            return parsed
        except Exception as e:
            return {"papers": [], "error": str(e)}
