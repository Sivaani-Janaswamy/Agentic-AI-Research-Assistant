from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class SummarizerAgent:

    def run(self, papers):
        summarized = []

        for paper in papers:
            prompt = f"""
            Summarize this research paper in 5 concise bullet points.
            Focus on:
            - Problem
            - Method
            - Dataset
            - Results
            - Contribution

            Title: {paper['title']}
            Abstract: {paper['summary']}
            """

            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                temperature=0.3,
                max_tokens=400,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            summarized.append({
                "title": paper["title"],
                "summary": response.choices[0].message.content,
                "pdf_url": paper["pdf_url"]
            })

        return summarized