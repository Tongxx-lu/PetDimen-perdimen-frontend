# PetDimen 小程序开发指南

## 目录

1. [项目设置](#项目设置)
2. [开发环境](#开发环境)
3. [代码结构](#代码结构)
4. [API 集成](#api-集成)
5. [页面开发](#页面开发)
6. [样式指南](#样式指南)
7. [调试技巧](#调试技巧)
8. [常见问题](#常见问题)

## 项目设置

### 1. 获取 AppID

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册或登录账号
3. 创建小程序
4. 在 "设置" → "开发设置" 中获取 AppID

### 2. 配置项目

编辑 `project.config.json`，将 `appid` 替换为您的 AppID：

```json
{
  "appid": "YOUR_APPID_HERE"
}
```

### 3. 配置 API 地址

编辑 `app.js`，修改 API 基础 URL：

```javascript
globalData: {
  apiBaseUrl: 'http://your-domain.com/api'  // 修改为实际地址
}
```

## 开发环境

### 系统要求

- Windows 7 及以上 / macOS 10.12 及以上
- 微信开发者工具（最新版本）
- Node.js 12+ （可选，用于构建工具）

### 安装微信开发者工具

1. 访问 [微信开发者工具下载页面](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 下载对应操作系统的版本
3. 安装并启动

### 打开项目

1. 启动微信开发者工具
2. 点击 "打开" 按钮
3. 选择 `petdimen-weapp` 目录
4. 输入 AppID
5. 点击 "打开"

## 代码结构

### 文件组织

```
petdimen-weapp/
├── app.js                 # 应用入口，全局配置
├── app.json              # 应用配置（页面、权限等）
├── app.wxss              # 全局样式
├── pages/                # 页面目录
│   ├── index/           # 首页
│   ├── pet/             # 宠物管理
│   ├── behavior/        # 行为记录
│   ├── moments/         # 动态管理
│   ├── nearby/          # 附近服务
│   └── user/            # 用户中心
├── utils/               # 工具函数
├── assets/              # 资源文件
└── project.config.json  # 项目配置
```

### 页面文件结构

每个页面包含三个文件：

```
pages/example/
├── example.wxml         # 页面结构（类似 HTML）
├── example.wxss         # 页面样式（类似 CSS）
└── example.js           # 页面逻辑（JavaScript）
```

## API 集成

### 请求方法

所有 API 请求通过 `app.request()` 方法进行：

```javascript
const app = getApp();

app.request({
  url: '/pets',
  method: 'GET',
  data: {},
  success: (data) => {
    console.log('成功:', data);
  },
  fail: (err) => {
    console.error('失败:', err);
  },
  complete: () => {
    console.log('完成');
  }
});
```

### 请求参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| url | string | 是 | API 端点（不包含域名） |
| method | string | 否 | HTTP 方法，默认 GET |
| data | object | 否 | 请求数据 |
| success | function | 否 | 成功回调 |
| fail | function | 否 | 失败回调 |
| complete | function | 否 | 完成回调 |

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

### 错误处理

自动处理的错误：

- `AUTH_401`：Token 过期，自动重新登录
- 网络错误：显示错误提示
- 其他错误：调用 fail 回调

## 页面开发

### 创建新页面

1. 在 `pages` 目录下创建新文件夹
2. 创建三个文件：`.wxml`、`.wxss`、`.js`
3. 在 `app.json` 中添加页面路径

### 页面生命周期

```javascript
Page({
  onLoad(options) {
    // 页面加载时执行
    // options 包含页面参数
  },

  onShow() {
    // 页面显示时执行
    // 每次进入页面都会执行
  },

  onHide() {
    // 页面隐藏时执行
  },

  onUnload() {
    // 页面卸载时执行
    // 清理资源
  },

  onPullDownRefresh() {
    // 下拉刷新时执行
  },

  onReachBottom() {
    // 上拉加载更多时执行
  }
});
```

### 数据绑定

WXML 中的数据绑定：

```wxml
<!-- 文本插值 -->
<text>{{message}}</text>

<!-- 属性绑定 -->
<image src="{{imageUrl}}" />

<!-- 条件渲染 -->
<view wx:if="{{condition}}">显示</view>

<!-- 列表渲染 -->
<view wx:for="{{items}}" wx:key="id">
  {{item.name}}
</view>
```

JS 中更新数据：

```javascript
this.setData({
  message: 'Hello',
  imageUrl: 'https://...',
  condition: true,
  items: [...]
});
```

### 事件处理

WXML 中绑定事件：

```wxml
<button bindtap="onButtonClick" data-id="123">
  点击
</button>

<input bindinput="onInputChange" />
```

JS 中处理事件：

```javascript
onButtonClick(e) {
  const id = e.currentTarget.dataset.id;
  console.log('按钮被点击，ID:', id);
},

onInputChange(e) {
  const value = e.detail.value;
  console.log('输入值:', value);
}
```

### 页面导航

```javascript
// 打开新页面
wx.navigateTo({
  url: '/pages/pet/detail?id=123'
});

// 返回上一页
wx.navigateBack();

// 重定向（替换当前页面）
wx.redirectTo({
  url: '/pages/index/index'
});

// 切换 Tab 页面
wx.switchTab({
  url: '/pages/pet/list'
});
```

## 样式指南

### 颜色系统

```css
/* 主色 */
--primary-color: #FF6B6B;      /* 红色 */
--secondary-color: #4ECDC4;    /* 青色 */

/* 状态色 */
--success-color: #95DE64;      /* 成功 */
--warning-color: #FAAD14;      /* 警告 */
--error-color: #FF4D4F;        /* 错误 */
--info-color: #1890FF;         /* 信息 */

/* 文本色 */
--text-primary: #333;          /* 主文本 */
--text-secondary: #666;        /* 次文本 */
--text-tertiary: #999;         /* 辅助文本 */

/* 背景色 */
--bg-light: #f5f5f5;           /* 浅色背景 */
--bg-white: #fff;              /* 白色背景 */
--border-color: #e8e8e8;       /* 边框色 */
```

### 常用组件样式

```css
/* 卡片 */
.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 按钮 */
.btn {
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary {
  background-color: #FF6B6B;
  color: #fff;
}

/* 输入框 */
.form-input {
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  border-color: #FF6B6B;
}
```

### 响应式设计

使用 `rpx`（响应式像素）单位：

```css
/* 1rpx = 0.5px（在 375px 宽度设备上） */
.container {
  width: 750rpx;      /* 满屏宽度 */
  padding: 32rpx;     /* 16px */
  margin: 16rpx;      /* 8px */
}
```

## 调试技巧

### 使用调试器

1. 打开微信开发者工具
2. 点击 "调试器" 标签
3. 查看 "Console" 输出日志
4. 使用 "Network" 查看网络请求

### 添加日志

```javascript
// 输出日志
console.log('信息:', data);
console.warn('警告:', warning);
console.error('错误:', error);

// 调试变量
console.table(arrayData);
```

### 真机调试

1. 在微信开发者工具中点击 "预览"
2. 使用微信扫描二维码
3. 在真机上查看效果
4. 点击右上角 "..." → "打开调试"

### 性能分析

1. 打开微信开发者工具
2. 点击 "Performance" 标签
3. 点击 "Record" 开始录制
4. 执行操作
5. 点击 "Stop" 停止录制
6. 分析性能数据

## 常见问题

### Q: 如何处理 CORS 问题？

A: 微信小程序不受 CORS 限制，但需要在微信公众平台配置合法域名。

### Q: 如何存储用户数据？

A: 使用 `wx.setStorageSync()` 和 `wx.getStorageSync()`：

```javascript
// 保存
wx.setStorageSync('key', value);

// 读取
const value = wx.getStorageSync('key');

// 删除
wx.removeStorageSync('key');
```

### Q: 如何处理异步操作？

A: 使用 Promise 或 async/await：

```javascript
// Promise 方式
loadData() {
  return new Promise((resolve, reject) => {
    app.request({
      url: '/data',
      success: (data) => resolve(data),
      fail: (err) => reject(err)
    });
  });
}

// async/await 方式
async loadData() {
  try {
    const data = await this.loadData();
    this.setData({ data });
  } catch (err) {
    console.error('加载失败:', err);
  }
}
```

### Q: 如何优化加载性能？

A: 
- 使用分页加载数据
- 缓存常用数据
- 延迟加载非关键资源
- 压缩图片
- 使用 CDN 加速

### Q: 如何处理权限申请？

A: 在 `app.json` 中配置权限：

```json
{
  "permission": {
    "scope.userLocation": {
      "desc": "获取您的位置信息"
    },
    "scope.userInfo": {
      "desc": "获取您的昵称、头像等信息"
    }
  }
}
```

### Q: 如何实现下拉刷新？

A: 在 `app.json` 中启用，然后在页面中处理：

```json
{
  "window": {
    "enablePullDownRefresh": true,
    "backgroundTextStyle": "dark"
  }
}
```

```javascript
onPullDownRefresh() {
  this.loadData();
  wx.stopPullDownRefresh();
}
```

## 最佳实践

1. **代码组织**：按功能模块组织代码
2. **错误处理**：始终处理 API 错误
3. **用户反馈**：提供加载、成功、失败提示
4. **性能优化**：避免频繁的 DOM 操作
5. **安全性**：不要在代码中硬编码敏感信息
6. **可访问性**：提供清晰的界面和交互
7. **测试**：在真机上测试所有功能

## 参考资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信小程序 API 文档](https://developers.weixin.qq.com/miniprogram/dev/api/)
- [微信开发者工具文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html)

---

**最后更新**：2025-01-01
