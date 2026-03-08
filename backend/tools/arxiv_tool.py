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
            "id": result.entry_id.split('/')[-1],
            "title": result.title,
            "summary": result.summary,
            "pdf_url": result.pdf_url,
            "authors": [a.name for a in result.authors]
        })

    return papers

def get_paper_by_id(paper_id):
    search = arxiv.Search(id_list=[paper_id])
    try:
        result = next(search.results())
        return {
            "id": result.entry_id.split('/')[-1],
            "title": result.title,
            "summary": result.summary,
            "pdf_url": result.pdf_url,
            "authors": [a.name for a in result.authors]
        }
    except StopIteration:
        return None