from agents.retriever_agent import RetrieverAgent
from agents.summarizer_agent import SummarizerAgent
from agents.extractor_agent import ExtractorAgent
from agents.gap_agent import GapAgent
from vector_store import VectorStore
from rag_agent import RAGAgent
import json

def main():
    query = input("Enter research topic: ")

    retriever = RetrieverAgent()
    summarizer = SummarizerAgent()
    extractor = ExtractorAgent()
    gap_agent = GapAgent()

    print("\n🔎 Fetching papers from ArXiv...\n")
    papers = retriever.run(query)

    if not papers:
        print("No papers found.")
        return

    print("🧠 Summarizing papers using LLaMA 3...\n")
    summaries = summarizer.run(papers)

    print("📂 Extracting datasets & code links...\n")
    extracted_info = extractor.run(papers)

    for i, (summary, extraction) in enumerate(zip(summaries, extracted_info), 1):
        print("=" * 70)
        print(f"Paper {i}: {summary['title']}")
        print("-" * 70)

        print("\n📝 Summary:\n")
        print(summary["summary"])

        print("\n🔗 Dataset / Code Info:\n")
        print(extraction["extracted"])

        print("\n📄 PDF:", summary["pdf_url"])
        print("=" * 70, "\n")

    print("\n🔬 Analyzing Research Gaps Across Papers...\n")

    combined_data = []
    for summary, extraction in zip(summaries, extracted_info):
        combined_data.append({
            "title": summary["title"],
            "summary": summary["summary"],
            "extracted": extraction["extracted"]
        })

    gaps = gap_agent.run(combined_data)

    print("=" * 70)
    print("RESEARCH GAP ANALYSIS")
    print("=" * 70)
    print(gaps)

    # Save results
    with open("research_output.json", "w", encoding="utf-8") as f:
        json.dump({
            "papers": combined_data,
            "gaps": gaps
        }, f, indent=4)

    # 🔥 Create vector store
    vector_store = VectorStore()
    vector_store.add_documents(combined_data)
    rag_agent = RAGAgent()

    print("\n💬 You can now ask follow-up questions (type 'exit' to quit)\n")

    while True:
         question = input("Ask a question: ")
         if question.lower() == "exit":
           break

         relevant_docs = vector_store.search(question, k=2)

         answer = rag_agent.answer(question, relevant_docs)

         print("\n🤖 Answer:\n")
         print(answer)
         print()
    print("\n✅ Results saved to research_output.json")


if __name__ == "__main__":
    main()