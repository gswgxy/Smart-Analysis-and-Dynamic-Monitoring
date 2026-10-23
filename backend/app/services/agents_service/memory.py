# app/agents/memory.py
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.store.memory import InMemoryStore

# 短期记忆：按 thread_id 存对话历史
_checkpointer = InMemorySaver()

# 长期记忆：跨会话存用户偏好/事实
_store = InMemoryStore()

def get_checkpointer():
    return _checkpointer

def get_store():
    return _store