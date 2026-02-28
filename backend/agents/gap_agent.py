from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class GapAgent:

    def run(self, summaries):

        combined_text = "\n\n".join([s["summary"] for s in summaries])

        prompt = f"""
        Based on these research summaries:

        {combined_text}

        Identify:
        1. Common limitations
        2. Missing research directions
        3. Potential research opportunities
        4. One strong hackathon-level research idea
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            temperature=0.4,
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.choices[0].message.content