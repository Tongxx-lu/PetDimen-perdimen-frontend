# 🎉 PetDimen 微信小程序 - 从这里开始

欢迎使用 PetDimen 微信小程序！本文档将帮助您快速了解和使用本项目。

## 📋 项目简介

PetDimen 是一个完整的宠物行为记录与社交平台的微信小程序客户端，使用微信开发者工具原生语言开发。

### 核心功能
- 🐾 **宠物档案管理** - 创建和管理多只宠物
- 📝 **行为记录** - 记录宠物的日常行为
- 💊 **健康管理** - 设置健康提醒和查看报告
- 📸 **社交动态** - 发布和浏览宠物动态
- 🏥 **附近服务** - 查找附近的宠物医院和寄养

## 🚀 5 分钟快速开始

### 步骤 1：获取 AppID
1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册或登录
3. 创建小程序
4. 获取 AppID

### 步骤 2：配置项目
编辑 `project.config.json`，将 `appid` 替换为您的 AppID：
```json
{
  "appid": "YOUR_APPID_HERE"
}
```

### 步骤 3：配置 API 地址
编辑 `app.js`，修改 API 基础 URL：
```javascript
globalData: {
  apiBaseUrl: 'http://your-domain.com/api'
}
```

### 步骤 4：打开项目
1. 启动微信开发者工具
2. 点击 "打开"
3. 选择 `petdimen-weapp` 目录
4. 输入 AppID
5. 点击 "打开"

### 步骤 5：预览
1. 点击 "预览"
2. 使用微信扫描二维码
3. 在真机上查看效果

## 📚 文档导航

根据您的需求选择相应的文档：

### 🆕 新手入门
- **[INDEX.md](./INDEX.md)** - 完整文档索引和导航
- **[README.md](./README.md)** - 项目概述和功能说明

### 💻 开发指南
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - 详细的开发指南
  - 环境配置
  - 代码结构
  - API 集成
  - 页面开发
  - 调试技巧

### ⚡ 快速参考
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - 常用代码片段
  - API 调用示例
  - 数据绑定语法
  - 常用 API
  - 样式技巧

### 📖 深入了解
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - 实现细节
  - 架构设计
  - 技术实现
  - 代码规范
  - 性能优化

## 🎯 常见任务

### 我想...

#### 🔧 修改 API 地址
编辑 `app.js` 第 X 行：
```javascript
globalData: {
  apiBaseUrl: 'http://new-domain.com/api'
}
```

#### 📄 添加新页面
1. 在 `pages` 目录创建新文件夹
2. 创建 `.wxml`、`.wxss`、`.js` 三个文件
3. 在 `app.json` 中添加页面路径

#### 🔌 调用后端 API
```javascript
app.request({
  url: '/pets',
  method: 'GET',
  success: (data) => {
    console.log('成功:', data);
  }
});
```

#### 📸 上传文件
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

#### 🐛 调试代码
1. 打开微信开发者工具
2. 点击 "调试器" 标签
3. 查看 "Console" 输出
4. 使用 "Network" 查看请求

## 📁 项目结构一览

```
petdimen-weapp/
├── 📚 文档
│   ├── 00_START_HERE.md          ← 您在这里
│   ├── INDEX.md                  # 文档索引
│   ├── README.md                 # 项目说明
│   ├── DEVELOPMENT.md            # 开发指南
│   ├── QUICK_REFERENCE.md        # 快速参考
│   └── IMPLEMENTATION_SUMMARY.md # 实现总结
│
├── ⚙️ 核心文件
│   ├── app.js                    # 应用入口
│   ├── app.json                  # 应用配置
│   └── app.wxss                  # 全局样式
│
├── ⚙️ 配置文件
│   ├── project.config.json       # 开发者工具配置
│   └── sitemap.json              # 页面索引
│
└── 📱 页面
    ├── pages/index/              # 首页
    ├── pages/pet/                # 宠物管理
    │   ├── list.wxml             # 列表
    │   └── add.wxml              # 添加/编辑
    └── pages/behavior/           # 行为记录
        └── record.wxml
```

## 🎨 设计系统

### 颜色
- 🔴 主色：#FF6B6B（红色）
- 🔵 次色：#4ECDC4（青色）
- 🟢 成功：#95DE64（绿色）
- 🟡 警告：#FAAD14（橙色）

### 排版
- 标题：24px, 600 weight
- 副标题：16px, 600 weight
- 正文：14px, 400 weight

## 🔑 关键概念

### 页面生命周期
```javascript
Page({
  onLoad() {      // 页面加载
  onShow() {      // 页面显示
  onHide() {      // 页面隐藏
  onUnload() {    // 页面卸载
});
```

### 数据绑定
```wxml
<!-- 显示数据 -->
<text>{{message}}</text>

<!-- 列表渲染 -->
<view wx:for="{{items}}" wx:key="id">
  {{item.name}}
</view>

<!-- 事件处理 -->
<button bindtap="onTap">点击</button>
```

### 更新数据
```javascript
this.setData({
  message: 'Hello',
  items: [...]
});
```

## ❓ 常见问题

### Q: 如何在真机上测试？
A: 点击 "预览"，使用微信扫描二维码即可在真机上查看。

### Q: 如何处理 API 错误？
A: 所有 API 请求都包含错误处理，会自动显示错误提示。

### Q: 如何调试代码？
A: 使用微信开发者工具的调试器，查看 Console 输出和 Network 请求。

### Q: 如何添加新功能？
A: 参考 [DEVELOPMENT.md](./DEVELOPMENT.md) 中的 "页面开发" 部分。

## 📞 获取帮助

### 遇到问题？

1. **查看文档** - 首先查看 [INDEX.md](./INDEX.md) 或 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. **查看示例** - 参考已实现的页面代码
3. **调试代码** - 使用微信开发者工具的调试器
4. **查看日志** - 在 Console 中查看错误信息

### 官方资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信小程序 API](https://developers.weixin.qq.com/miniprogram/dev/api/)
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 页面数 | 4+ |
| 代码行数 | 2000+ |
| 文档页数 | 5 |
| 支持的功能 | 15+ |

## 🎓 学习路径

### 初级（1-2 小时）
1. 阅读 [README.md](./README.md)
2. 完成快速开始
3. 浏览首页代码

### 中级（2-4 小时）
1. 阅读 [DEVELOPMENT.md](./DEVELOPMENT.md)
2. 学习页面开发
3. 修改现有页面

### 高级（4+ 小时）
1. 阅读 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
2. 添加新页面
3. 优化性能

## 🚀 下一步

### 立即开始
1. ✅ 配置 AppID 和 API 地址
2. ✅ 打开项目
3. ✅ 预览应用
4. ✅ 查看代码

### 继续学习
1. 📖 阅读 [DEVELOPMENT.md](./DEVELOPMENT.md)
2. 💻 修改现有页面
3. ➕ 添加新页面
4. 🚀 发布应用

### 获取支持
- 📚 查看 [INDEX.md](./INDEX.md) 了解所有文档
- 🔍 使用 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 查找代码示例
- 💬 查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 中的常见问题

## 📝 版本信息

- **版本**：1.0.0
- **发布日期**：2025-01-01
- **最低基础库**：2.29.0
- **开发工具**：微信开发者工具

## 📄 许可证

本项目仅供学习使用。

---

## 🎯 快速链接

| 文档 | 用途 |
|------|------|
| [INDEX.md](./INDEX.md) | 完整文档索引 |
| [README.md](./README.md) | 项目概述 |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 开发指南 |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | 代码参考 |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | 实现细节 |

---

**祝您开发愉快！🎉**

如有任何问题，请查看相应的文档或联系开发团队。

**最后更新**：2025-01-01
