# app/tools.py
from langchain.tools import tool
from app.services.search_service import search_service
from app.services.kg_service import kg_service
from app.services.sql_service import sql_service
from app.services.rag_service import rag_service

@tool
def web_search(query: str) -> str:
    """联网搜索最新信息。"""
    return search_service.format_for_llm(query)

@tool
def kg_query(entity: str, depth: int = 2) -> str:
    """查询知识图谱中实体的关联关系。"""
    return kg_service.query(entity, depth).to_llm_text()

@tool
def sql_query(sql: str) -> str:
    """执行只读 SQL 查询。仅允许 SELECT。"""
    return sql_service.execute_readonly(sql).to_llm_text()

@tool
def rag_retrieve(question: str, top_k: int = 5) -> str:
    """从向量库检索相关文档片段。"""
    return rag_service.retrieve_text(question, top_k)

ALL_TOOLS = [web_search, kg_query, sql_query, rag_retrieve]