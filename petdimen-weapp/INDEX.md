# PetDimen 微信小程序 - 完整文档索引

## 📚 文档导航

### 快速开始
1. **[README.md](./README.md)** - 项目概述和快速开始指南
   - 项目简介
   - 技术栈
   - 快速开始步骤
   - 主要页面说明

2. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - 实现总结
   - 核心特性
   - 技术实现细节
   - 代码规范
   - 文件清单

### 开发指南
3. **[DEVELOPMENT.md](./DEVELOPMENT.md)** - 详细开发指南
   - 项目设置
   - 开发环境配置
   - 代码结构说明
   - API 集成方法
   - 页面开发教程
   - 样式指南
   - 调试技巧
   - 常见问题解答

4. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - 快速参考
   - 常用代码片段
   - API 调用示例
   - 页面生命周期
   - 数据绑定语法
   - 常用 API
   - 样式技巧
   - 调试技巧

## 🗂️ 项目结构

```
petdimen-weapp/
├── 📄 文档文件
│   ├── README.md                    # 项目说明
│   ├── DEVELOPMENT.md               # 开发指南
│   ├── IMPLEMENTATION_SUMMARY.md    # 实现总结
│   ├── QUICK_REFERENCE.md           # 快速参考
│   └── INDEX.md                     # 本文件
│
├── 📱 应用核心
│   ├── app.js                       # 应用入口
│   ├── app.json                     # 应用配置
│   └── app.wxss                     # 全局样式
│
├── ⚙️ 项目配置
│   ├── project.config.json          # 开发者工具配置
│   └── sitemap.json                 # 页面索引
│
└── 📄 页面文件
    ├── pages/index/                 # 首页
    │   ├── index.wxml
    │   ├── index.wxss
    │   └── index.js
    ├── pages/pet/                   # 宠物管理
    │   ├── list.wxml                # 宠物列表
    │   ├── list.wxss
    │   ├── list.js
    │   ├── add.wxml                 # 添加/编辑宠物
    │   ├── add.wxss
    │   └── add.js
    └── pages/behavior/              # 行为记录
        ├── record.wxml
        ├── record.wxss
        └── record.js
```

## 🚀 快速开始

### 第一步：配置 AppID
编辑 `project.config.json`：
```json
{
  "appid": "YOUR_APPID_HERE"
}
```

### 第二步：配置 API 地址
编辑 `app.js`：
```javascript
globalData: {
  apiBaseUrl: 'http://your-domain.com/api'
}
```

### 第三步：打开项目
1. 启动微信开发者工具
2. 点击 "打开"
3. 选择 `petdimen-weapp` 目录
4. 输入 AppID
5. 点击 "打开"

### 第四步：预览
1. 点击 "预览"
2. 使用微信扫描二维码
3. 在真机上查看效果

## 📖 功能说明

### 已实现的功能

#### 🏠 首页 (pages/index/index)
- 个性化欢迎信息
- 快速操作卡片
- 宠物列表预览
- 健康提醒列表
- 最新动态列表

#### 🐾 宠物管理 (pages/pet/*)
- **列表页**：搜索、筛选、分页
- **添加/编辑页**：表单验证、头像上传、标签选择

#### 📝 行为记录 (pages/behavior/record)
- 宠物选择
- 12 种行为类型
- 日期时间选择
- 位置选择
- 媒体上传

### 待实现的功能

- [ ] 宠物详情页
- [ ] 动态管理（发布、浏览、互动）
- [ ] 附近服务查询
- [ ] 用户中心（个人资料、设置）

## 🔧 常用操作

### 添加新页面

1. 在 `pages` 目录创建新文件夹
2. 创建三个文件：`.wxml`、`.wxss`、`.js`
3. 在 `app.json` 中添加页面路径

### 调用 API

```javascript
app.request({
  url: '/pets',
  method: 'GET',
  success: (data) => {
    console.log('成功:', data);
  },
  fail: (err) => {
    console.error('失败:', err);
  }
});
```

### 上传文件

```javascript
app.uploadFile({
  filePath: tempFilePath,
  name: 'file',
  url: '/upload/image',
  success: (data) => {
    console.log('上传成功:', data.url);
  }
});
```

### 页面导航

```javascript
// 打开新页面
wx.navigateTo({
  url: '/pages/pet/list'
});

// 返回上一页
wx.navigateBack();
```

## 📊 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| 微信小程序 | 2.29.0+ | 应用框架 |
| JavaScript | ES6+ | 业务逻辑 |
| WXML | - | 页面结构 |
| WXSS | - | 页面样式 |

## 🎨 设计系统

### 颜色
- 主色：#FF6B6B（红色）
- 次色：#4ECDC4（青色）
- 成功：#95DE64（绿色）
- 警告：#FAAD14（橙色）
- 错误：#FF4D4F（红色）

### 排版
- 标题：24px, 600 weight
- 副标题：16px, 600 weight
- 正文：14px, 400 weight
- 辅助：12px, 400 weight

## 🐛 调试

### 打开调试器
1. 微信开发者工具 → 调试器
2. 查看 Console 输出
3. 使用 Network 查看请求

### 真机调试
1. 点击 "预览"
2. 微信扫描二维码
3. 点击右上角 "..." → "打开调试"

## 📚 相关资源

### 官方文档
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信小程序 API](https://developers.weixin.qq.com/miniprogram/dev/api/)
- [WXML 文档](https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/)
- [WXSS 文档](https://developers.weixin.qq.com/miniprogram/dev/reference/wxss/)

### 项目相关
- [后端 API 文档](../petdimen-backend/后端系统总结.md)
- [数据库设计](../scripts/db/init.sql)
- [项目需求文档](../specs/overview/requirements.md)

## 💡 最佳实践

### 代码组织
- 按功能模块组织代码
- 使用清晰的命名规范
- 添加必要的注释

### 错误处理
- 始终处理 API 错误
- 提供用户反馈
- 记录错误日志

### 性能优化
- 使用分页加载
- 缓存常用数据
- 避免频繁的 setData

### 安全性
- 不硬编码敏感信息
- 使用 HTTPS 传输
- 验证用户输入

## ❓ 常见问题

### Q: 如何修改 API 地址？
A: 编辑 `app.js` 中的 `apiBaseUrl`

### Q: 如何添加新页面？
A: 参考 [DEVELOPMENT.md](./DEVELOPMENT.md) 中的 "创建新页面" 部分

### Q: 如何调试代码？
A: 使用微信开发者工具的调试器，参考 [DEVELOPMENT.md](./DEVELOPMENT.md) 中的 "调试技巧" 部分

### Q: 如何处理网络错误？
A: 所有 API 请求都包含错误处理，参考 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 中的 "常见错误处理" 部分

## 📞 支持

如有问题或建议，请联系开发团队。

## 📝 更新日志

### v1.0.0 (2025-01-01)
- ✨ 首页：快速操作、宠物列表、健康提醒、最新动态
- ✨ 宠物管理：列表、添加/编辑
- ✨ 行为记录：记录宠物行为
- 📚 完整的文档和开发指南

## 📄 许可证

本项目仅供学习使用。

---

## 🗺️ 文档地图

```
快速开始
├── README.md (项目概述)
└── QUICK_REFERENCE.md (快速参考)

深入学习
├── DEVELOPMENT.md (开发指南)
└── IMPLEMENTATION_SUMMARY.md (实现总结)

代码示例
└── QUICK_REFERENCE.md (常用代码片段)

问题解答
├── DEVELOPMENT.md (常见问题)
└── README.md (FAQ)
```

**最后更新**：2025-01-01  
**维护者**：PetDimen 开发团队
