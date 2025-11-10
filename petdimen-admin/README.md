# PetDimen 管理后台（petdimen-admin）

基于 Vue 3 + TypeScript + Vite 的管理员 Web 界面，连接后端 `/api/admin/**` 接口进行后台管理。

## 功能概览
- 登录鉴权（JWT，仅 ADMIN 角色可进）
- 布局与导航（Element Plus）
- 用户管理（分页、搜索、禁用/启用）
- 内容审核（动态审核、评论审核）
- 账单分类管理（新增、修改、删除）

## 运行前置
- Node.js 20+（已在 `package.json` 指定引擎）
- 后端服务已运行：`http://localhost:8080`

> 开发环境已配置 Vite 代理，将前端 `/api` 请求代理到后端，避免跨域。

## 开发启动

```bash
npm install
npm run dev
```

访问：`http://localhost:5173`

### 管理员测试账号
后端测试数据脚本提供：

- 用户名：`admin`
- 密码：`123456`

登录成功后将自动注入 `Authorization: Bearer <token>` 到请求头。

## 接口地址配置
默认通过 Vite 代理访问后端（见 `vite.config.ts` 的 `server.proxy`）。

也可手动指定基础地址（可选）：在启动命令前设置环境变量 `VITE_API_BASE`，例如：

```bash
# Windows PowerShell
$env:VITE_API_BASE="http://localhost:8080"; npm run dev

# bash
VITE_API_BASE="http://localhost:8080" npm run dev
```

前端会优先使用 `VITE_API_BASE`，否则回退为 `http://localhost:8080`。

## 生产构建

```bash
npm run build
```

构建产物位于 `dist/`。

