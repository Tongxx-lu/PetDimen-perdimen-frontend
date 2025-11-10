# PetDimen 前端系统总结

## 项目简介

PetDimen 前端系统是一个基于 Vue 3 + TypeScript + Vite 构建的管理后台界面，用于管理宠物行为记录与社交平台的数据和功能。该系统提供了完整的后台管理功能，支持用户管理、内容审核、系统配置等核心业务操作。
用户界面正在开发

## 技术栈

- **前端框架**：Vue 3.5.22
- **编程语言**：TypeScript 5.9.0
- **构建工具**：Vite 7.1.11
- **UI组件库**：Element Plus 2.9.2
- **状态管理**：Pinia 2.2.6
- **路由管理**：Vue Router 4.4.5
- **HTTP客户端**：Axios 1.7.7
- **图表库**：ECharts 6.0.0 / vue-echarts 8.0.1
- **开发工具**：TypeScript、Vite Plugin Vue DevTools 8.0.3

## 项目结构

```
petdimen-admin/
├── src/
│   ├── api/                  # API接口定义
│   │   ├── admin.ts          # 管理员相关接口
│   │   ├── auth.ts           # 认证相关接口
│   │   └── client.ts         # Axios配置和拦截器
│   ├── layouts/              # 布局组件
│   │   └── AdminLayout.vue   # 后台主布局
│   ├── pages/                # 页面组件(14个)
│   │   ├── Login.vue         # 登录页
│   │   ├── Dashboard.vue     # 仪表盘
│   │   ├── Users.vue         # 用户管理
│   │   ├── Moderation.vue    # 内容审核
│   │   └── ...               # 其他功能页面
│   ├── router/               # 路由配置
│   │   └── index.ts          # 路由定义和守卫
│   ├── stores/               # 状态管理
│   │   └── auth.ts           # 认证状态管理
│   ├── styles/               # 样式文件
│   │   └── global.css        # 全局样式
│   ├── App.vue               # 应用根组件
│   └── main.ts               # 应用入口
├── public/                   # 静态资源
├── package.json              # 项目配置和依赖
├── tsconfig.json             # TypeScript配置
└── vite.config.ts            # Vite配置
```

## 核心功能模块

### 1. 认证与权限管理
- JWT token认证机制
- 基于角色的访问控制（仅ADMIN角色可访问）
- 路由守卫验证用户权限
- 自动处理401/403错误并重定向到登录页

### 2. 用户管理
- 用户列表查询与分页
- 用户搜索功能
- 用户状态管理（禁用/启用）
- 用户详细信息查看

### 3. 内容审核系统
- 动态内容审核
- 评论内容审核
- 举报处理功能
- 敏感词管理

### 4. 系统配置管理
- 系统基础配置
- 公告管理
- 审计日志查看
- 宠物标签管理

### 5. 账单与商品管理
- 账单分类管理（新增、修改、删除）
- 商店管理功能
- 数据统计与展示

## 技术亮点

### 1. 现代化前端架构
- 采用Vue 3 Composition API设计模式
- TypeScript提供完整的类型安全
- 组件化开发，提高代码复用性

### 2. 性能优化
- 组件懒加载策略
- 路由预加载
- Axios请求拦截和响应统一处理

### 3. 用户体验优化
- Element Plus提供美观一致的UI界面
- 完善的错误处理和提示机制
- 登录状态保持和自动重定向

### 4. 灵活的API配置
- 支持环境变量配置API基础地址
- 统一的请求/响应拦截器
- 自动处理JWT token注入

### 5. 完整的路由管理
- 嵌套路由实现复杂布局
- 路由守卫确保安全访问
- 动态路由加载

## 系统配置

### 环境要求
- Node.js 20.19.0 或更高版本
- npm 或 yarn 包管理器
- 后端服务需运行在 http://localhost:8080

### API地址配置
通过环境变量可自定义API基础地址：

```bash
# Windows PowerShell
$env:VITE_API_BASE="http://localhost:8080"; npm run dev

# bash
VITE_API_BASE="http://localhost:8080" npm run dev
```

默认情况下，系统会使用Vite代理将`/api`请求转发到后端。

## 开发与部署

### 开发启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问地址：http://localhost:5173

### 生产构建

```bash
npm run build
```

构建产物位于`dist/`目录，可部署到任何静态文件服务器。

### 类型检查

```bash
npm run type-check
```

## 测试账号

```
用户名：admin
密码：123456
```

## 接口调用流程

1. 登录后，系统自动将JWT token存储在localStorage中
2. 后续API请求会通过Axios拦截器自动添加`Authorization: Bearer <token>`头
3. 后端验证token有效性，返回相应数据
4. 前端统一处理响应格式和错误情况

## 总结

PetDimen前端系统是一个功能完善、架构合理的宠物管理平台后台界面。系统采用现代前端技术栈构建，具有良好的可维护性和扩展性。通过合理的组件化设计和状态管理，实现了高效的开发和用户体验。系统涵盖了宠物平台所需的核心管理功能，为后端数据提供了直观的操作界面，支持管理员对平台进行全面的监控和管理。
