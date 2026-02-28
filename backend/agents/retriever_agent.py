from tools.arxiv_tool import fetch_papers

class RetrieverAgent:

    def run(self, query):
        papers = fetch_papers(query)
        return papers