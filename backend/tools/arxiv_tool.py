import arxiv

def fetch_papers(query, max_results=5):

    refined_query = f'all:"{query}"'

    search = arxiv.Search(
        query=refined_query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.Relevance
    )

    papers = []

    for result in search.results():
        papers.append({
            "title": result.title,
            "summary": result.summary,
            "pdf_url": result.pdf_url,
            "authors": [a.name for a in result.authors]
        })

    return papers