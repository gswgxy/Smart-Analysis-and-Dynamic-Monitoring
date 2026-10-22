# 前端说明

Vue 3 + TypeScript + Vite + Pinia + Vue Router + Element Plus + ECharts。

## 启动

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

访问 http://localhost:5173，默认账号 `admin / admin123`。

前端登录依赖后端运行在 http://127.0.0.1:8000。完整启动步骤见项目根目录 `README.md`。

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api/v1` | Axios 请求前缀 |
| `VITE_PROXY_TARGET` | `http://127.0.0.1:8000` | Vite 开发代理目标 |
| `VITE_APP_TITLE` | 平台名称 | 预留的应用标题 |

开发环境推荐使用相对路径 `/api/v1`，由 Vite 代理请求，避免本地跨域配置。

## 目录

```text
src/
├─ api/          登录、监测、分析、报告接口
├─ components/   页面标题、指标卡、图表、证据抽屉等
├─ config/       菜单配置
├─ layouts/      主布局
├─ mock/         尚未接入模块的演示数据
├─ router/       路由与登录/角色守卫
├─ stores/       Pinia 登录态
├─ styles/       全局主题
├─ types/        TypeScript 类型
├─ utils/        Axios、格式化、图表主题
└─ views/        业务页面
```

## 路由

| 模块 | 路由 |
| --- | --- |
| 登录 | `/login` |
| 工作台 | `/dashboard` |
| 动态监测 | `/monitoring/overview`、`/monitoring/index`、`/monitoring/indicators`、`/monitoring/forecast`、`/monitoring/risks`、`/monitoring/chain-graph`、`/monitoring/enterprises`、`/monitoring/regions` |
| 智能分析 | `/analysis/qa`、`/analysis/chain`、`/analysis/topic`、`/analysis/risk`、`/analysis/evidence` |
| 报告中心 | `/reports/generate`、`/reports`、`/reports/exports`、`/notifications` |
| 平台管理 | `/admin/data-sources`、`/admin/metrics`、`/admin/models`、`/admin/templates`、`/admin/users`、`/admin/system`、`/admin/audit` |
| 专家审核 | `/reviews/tasks`、`/reviews/workbench/REV-20261018-003`、`/reviews/records` |

## 登录与请求

- 登录接口：`POST /api/v1/auth/login`。
- 当前用户：`GET /api/v1/auth/me`。
- 总览接口：`GET /api/v1/monitoring/overview`。
- Token 保存键：`dip_access_token`。
- 请求头：`Authorization: Bearer <access_token>`。
- 401：清理 token，跳转登录页并携带 `redirect`。
- 403：提示无权限并进入 `/403`。
- 应用返回码不是 `0`：抛出 `ApiError`，展示后端 `message` 和 `traceId`。

## 数据接入约定

尚未由 B、C 交付的页面使用 `src/mock/data.ts`。接口封装位于：

- `src/api/auth.ts`
- `src/api/monitoring.ts`
- `src/api/analysis.ts`
- `src/api/reports.ts`

保留现有统一返回格式：

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "traceId": "xxx",
  "timestamp": "2026-10-18T10:00:00+08:00"
}
```

后续只需在页面中把演示数据替换为接口返回值，公共布局、路由、图表和组件不需要重构。

## 构建

```powershell
npm run typecheck
npm run build
```

构建产物位于 `dist/`。部署静态服务器时需要开启 History 路由回退，将所有未知路径回退到 `index.html`。
