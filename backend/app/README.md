│ ├── main.py # FastAPI 入口：注册中间件、异常、路由、生命周期
│ │
│ ├── core/ # 全局核心（与业务无关）
│ ├── api/ # 路由层：只接收参数、调用 service
│ ├── agents/ # Agent 编排层（核心业务）
│ ├── tools/ # 工具层：Agent 可调用的能力封装
│ ├── services/ # 业务逻辑层
│ ├── pipelines/ # 数据构建层（离线/准实时）
│ ├── clients/ # 各数据库/外部服务客户端封装
│ ├── models/ # SQLAlchemy ORM 模型
│ ├── schemas/ # Pydantic 校验/序列化
│ ├── db/ # 关系库连接
│ ├── utils/ # 通用工具
│ └── constants/ # 常量、枚举
│ ├── init.py
│ └── enums.py # ToolType、DBType、AgentState 等
----------------------------------------------------------------------------------2026.10.22 QET