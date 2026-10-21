# API 约定

## 统一成功返回

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "traceId": "xxx",
  "timestamp": "2026-10-19T10:00:00+08:00"
}
```

## 统一错误返回

```json
{
  "code": 40101,
  "message": "未登录或Token无效",
  "data": null,
  "traceId": "xxx",
  "timestamp": "2026-10-19T10:00:00+08:00"
}
```

## 接口前缀

`/api/v1`
