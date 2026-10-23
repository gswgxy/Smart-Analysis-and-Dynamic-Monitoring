# app/agent/main_agent.py
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware
from app.tools import web_search, kg_query, sql_query, rag_retrieve
from app.agents.memory import get_checkpointer
from app.agents.prompts import SYSTEM_PROMPT

def build_agent():
    return create_agent(
        model="deepseek:deepseek-flash",          # 或你自己的模型
        tools=[web_search, kg_query, sql_query, rag_retrieve],
        system_prompt=SYSTEM_PROMPT,
        middleware=[
            SummarizationMiddleware(trigger={"tokens": 4000}),  # 长对话压缩[citation:7]
        ],
        checkpointer=get_checkpointer(), 
    )