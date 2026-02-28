from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ExtractorAgent:

    def run(self, papers):
        extracted_info = []

        for paper in papers:
            prompt = f"""
            From the following research abstract, extract:
            - Dataset names
            - Benchmark names
            - GitHub or code links (if mentioned)

            If not mentioned, say 'Not specified'.

            Abstract:
            {paper['summary']}
            """

            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                temperature=0.2,
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}]
            )

            extracted_info.append({
                "title": paper["title"],
                "extracted": response.choices[0].message.content
            })

        return extracted_info