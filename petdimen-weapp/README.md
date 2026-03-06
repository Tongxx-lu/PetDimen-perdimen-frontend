# PetDimen 微信小程序

宠物行为记录与社交平台的微信小程序客户端，使用原生微信小程序语言开发。

## 项目概述

PetDimen 小程序为宠物主人提供完整的宠物管理、健康追踪、社交互动等功能。

### 核心功能

- **宠物档案管理**：创建、编辑、删除多只宠物档案，记录基本信息和标签
- **行为记录**：记录宠物的日常行为（喂食、遛弯、排便等）
- **健康管理**：设置健康提醒，生成健康报告
- **社交动态**：发布宠物动态，与其他宠物主人互动
- **附近服务**：查找附近的宠物医院、寄养等服务
- **用户中心**：管理个人信息、设置等

## 技术栈

- **开发语言**：JavaScript (ES6+)
- **标记语言**：WXML（微信标记语言）
- **样式**：WXSS（微信样式表）
- **框架**：微信小程序原生框架
- **最低基础库版本**：2.29.0

## 项目结构

```
petdimen-weapp/
├── app.js                    # 应用入口
├── app.json                  # 应用配置
├── app.wxss                  # 全局样式
├── pages/                    # 页面目录
│   ├── index/               # 首页
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.js
│   ├── pet/                 # 宠物管理
│   │   ├── list.wxml        # 宠物列表
│   │   ├── list.wxss
│   │   ├── list.js
│   │   ├── detail.wxml      # 宠物详情
│   │   ├── detail.wxss
│   │   ├── detail.js
│   │   ├── add.wxml         # 添加/编辑宠物
│   │   ├── add.wxss
│   │   └── add.js
│   ├── behavior/            # 行为记录
│   │   ├── record.wxml
│   │   ├── record.wxss
│   │   └── record.js
│   ├── moments/             # 动态管理
│   │   ├── list.wxml        # 动态列表
│   │   ├── list.wxss
│   │   ├── list.js
│   │   ├── publish.wxml     # 发布动态
│   │   ├── publish.wxss
│   │   └── publish.js
│   ├── nearby/              # 附近服务
│   │   ├── services.wxml
│   │   ├── services.wxss
│   │   └── services.js
│   └── user/                # 用户中心
│       ├── profile.wxml     # 个人资料
│       ├── profile.wxss
│       ├── profile.js
│       ├── settings.wxml    # 设置
│       ├── settings.wxss
│       └── settings.js
├── assets/                  # 资源文件
│   ├── icons/              # 图标
│   └── images/             # 图片
├── utils/                   # 工具函数
│   ├── api.js              # API 请求封装
│   ├── storage.js          # 本地存储
│   └── utils.js            # 通用工具
└── README.md               # 项目说明
```

## 快速开始

### 1. 环境要求

- 微信开发者工具（最新版本）
- 微信小程序账号
- 后端 API 服务运行中

### 2. 配置

#### 修改 API 基础 URL

在 `app.js` 中修改 `apiBaseUrl`：

```javascript
globalData: {
  apiBaseUrl: 'http://your-api-domain/api'  // 修改为实际的 API 地址
}
```

#### 配置微信小程序 AppID

在微信开发者工具中：
1. 打开项目设置
2. 输入您的微信小程序 AppID
3. 点击保存

### 3. 开发

使用微信开发者工具打开项目：

```bash
# 在微信开发者工具中
1. 点击 "打开" 按钮
2. 选择项目目录 petdimen-weapp
3. 输入 AppID
4. 点击 "打开"
```

### 4. 预览与发布

- **预览**：在微信开发者工具中点击 "预览" 按钮，使用微信扫码查看
- **发布**：完成开发后，在微信开发者工具中点击 "上传" 按钮提交审核

## 主要页面说明

### 首页 (pages/index/index)

- 显示欢迎信息和当前时间
- 快速操作卡片（我的宠物、记录行为、发布动态、附近服务）
- 宠物列表预览
- 健康提醒列表
- 最新动态列表

### 宠物管理 (pages/pet/*)

- **列表页**：显示所有宠物，支持搜索和筛选
- **详情页**：显示宠物详细信息和相关数据
- **添加/编辑页**：创建或修改宠物档案

### 行为记录 (pages/behavior/record)

- 选择宠物
- 选择行为类型
- 记录时间和位置
- 添加备注和媒体

### 动态管理 (pages/moments/*)

- **列表页**：浏览所有动态，支持点赞、评论、分享
- **发布页**：创建新动态，支持图片和视频上传

### 附近服务 (pages/nearby/services)

- 基于位置查询附近服务
- 显示服务详情和评分
- 支持导航跳转

### 用户中心 (pages/user/*)

- **个人资料**：查看和编辑个人信息
- **设置**：应用设置、隐私设置等

## API 接口调用

所有 API 请求都通过 `app.request()` 方法进行，该方法自动处理：

- 添加 Authorization header
- 统一错误处理
- Token 过期自动刷新

### 使用示例

```javascript
app.request({
  url: '/pets',
  method: 'GET',
  success: (data) => {
    console.log('获取宠物列表成功:', data);
  },
  fail: (err) => {
    console.error('获取失败:', err);
  }
});
```

### 文件上传

```javascript
app.uploadFile({
  filePath: tempFilePath,
  name: 'file',
  url: '/upload/image',
  success: (data) => {
    console.log('上传成功:', data);
  },
  fail: (err) => {
    console.error('上传失败:', err);
  }
});
```

## 数据存储

使用微信小程序的本地存储 API：

```javascript
// 保存数据
wx.setStorageSync('token', token);

// 读取数据
const token = wx.getStorageSync('token');

// 删除数据
wx.removeStorageSync('token');

// 清空所有数据
wx.clearStorageSync();
```

## 权限申请

小程序需要以下权限：

- **位置信息**：用于查询附近服务和推荐
- **用户信息**：用于登录和个人资料
- **相机**：用于拍照上传
- **相册**：用于选择图片上传

## 常见问题

### Q: 如何处理 API 请求超时？

A: 在 `app.request()` 方法中已经处理了网络错误，会自动显示错误提示。

### Q: 如何调试？

A: 使用微信开发者工具的调试功能：
- 打开 "调试器"
- 查看 "Console" 标签中的日志
- 使用 "Network" 标签查看网络请求

### Q: 如何处理 Token 过期？

A: `app.request()` 方法会自动检测 `AUTH_401` 错误，并调用 `autoLogin()` 重新登录。

### Q: 如何优化性能？

A: 
- 使用分页加载数据
- 缓存常用数据
- 使用图片懒加载
- 避免频繁的 DOM 操作

## 开发规范

### 命名规范

- 文件名：小写 + 中划线（如 `pet-list.js`）
- 变量名：驼峰式（如 `petList`）
- 常量名：大写 + 下划线（如 `MAX_SIZE`）

### 代码风格

- 使用 2 个空格缩进
- 使用单引号
- 每行代码不超过 100 个字符
- 添加必要的注释

### 提交规范

使用 Git 提交代码时，遵循以下格式：

```
feat: 添加宠物列表功能
fix: 修复登录页面样式问题
docs: 更新 README
style: 调整代码格式
refactor: 重构 API 请求模块
test: 添加单元测试
chore: 更新依赖
```

## 性能指标

- 首屏加载时间：< 2.5s
- 单接口响应时间：< 300ms
- 内存占用：< 50MB

## 安全建议

1. **不要在代码中硬编码敏感信息**（如 API 密钥）
2. **使用 HTTPS 传输数据**
3. **验证所有用户输入**
4. **定期更新依赖**
5. **不要存储用户密码**，仅存储 Token

## 测试

### 测试场景

- 登录/注册流程
- 宠物 CRUD 操作
- 行为记录
- 动态发布和互动
- 附近服务查询
- 离线功能

### 测试工具

- 微信开发者工具内置调试器
- 真机测试（使用微信扫码预览）

## 部署

### 预发布环境

1. 在微信开发者工具中点击 "预览"
2. 使用微信扫码查看
3. 测试所有功能

### 正式发布

1. 完成所有测试
2. 在微信开发者工具中点击 "上传"
3. 在微信公众平台提交审核
4. 等待审核通过后发布

## 更新日志

### v1.0.0 (2025-01-01)

- ✨ 首页：快速操作、宠物列表、健康提醒、最新动态
- ✨ 宠物管理：列表、详情、添加/编辑
- ✨ 行为记录：记录宠物行为
- ✨ 动态管理：发布和浏览动态
- ✨ 附近服务：查询附近医院和寄养
- ✨ 用户中心：个人资料和设置

## 许可证

本项目仅供学习使用。

## 联系方式

如有问题或建议，请联系开发团队。

---

**最后更新**：2025-01-01  
**维护者**：PetDimen 开发团队
