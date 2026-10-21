# 北京数字产业动态监测与智能分析平台

A负责的最小统一底座。

## 启动后端

```powershell
cd backend
conda activate "自己的环境名字"
conda env create -f environment.yml              #第一次运行配环境
.env.example 复制后缀改为.env  里面写自己的api
uvicorn app.main:app --reload --port 8000
```

打开：

- http://127.0.0.1:8000/health
- http://127.0.0.1:8000/docs

测试账号：

- 用户名：admin
- 密码：admin123

## 当前范围

- FastAPI启动
- `/health`
- `/docs`
- 统一返回格式
- 统一异常处理
- 模拟登录
- JWT Token
- 当前用户依赖
- 受保护示例接口

数据库接入由B完成，后续把模拟用户替换为数据库用户。
