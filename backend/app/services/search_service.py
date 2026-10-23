import os
from dotenv import load_dotenv
from langchain_community.utilities import SearchApiAPIWrapper
os.environ["SEARCHAPI_API_KEY"] = os.getenv("SEARCHAPI_API_KEY")
search = SearchApiAPIWrapper()

def net_search(query: str) -> str:
    """
    进行互联网搜索。
    """
    response = search.run(query)
    return response
