from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class GapAgent:

    def run(self, summaries):
        """
        summaries: list of paper summaries/abstracts as strings or dicts
        """
        if isinstance(summaries[0], dict):
            combined_text = "\n\n".join([f"Title: {s.get('title')}\nAbstract: {s.get('summary')}" for s in summaries])
        else:
            combined_text = "\n\n".join(summaries)

        prompt = f"""
        Based on these research summaries, identify specific research gaps into a structured JSON format.
        
        The JSON MUST be an object with one key "gaps", containing a list of objects.
        Each object in the "gaps" list must have exactly these keys:
        - "title": (string, name of the gap)
        - "description": (string, detailed explanation)
        - "insight_level": (string, "Low", "Medium", or "High")

        Return ONLY the JSON. No other text.

        Research Summaries:
        {combined_text}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            temperature=0.4,
            max_tokens=800,
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {"gaps": [], "error": str(e)}