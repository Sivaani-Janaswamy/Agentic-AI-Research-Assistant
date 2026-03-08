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
            combined_text += f"ID: {p.get('id')}\nTitle: {p.get('title')}\nAbstract: {p.get('summary')}\n---\n"

        prompt = f"""
        Compare the following research papers and extract key metrics into a structured JSON matrix.
        
        The JSON MUST be an object with one key "papers", containing a list of objects.
        Each object in the "papers" list must have exactly these keys:
        - "id": (string, the ID provided)
        - "title": (string)
        - "accuracy": (string, specific accuracy metrics if mentioned, else "N/A")
        - "speed": (string, inference or training speed if mentioned, else "N/A")
        - "dataset": (string, main datasets used)
        - "hardware": (string, hardware used for experiments)

        Return ONLY the JSON. No other text.

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
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {"papers": [], "error": str(e)}
