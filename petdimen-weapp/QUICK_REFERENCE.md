# PetDimen 小程序 - 快速参考

## 常用代码片段

### API 请求

```javascript
// GET 请求
app.request({
  url: '/pets',
  method: 'GET',
  success: (data) => {
    console.log(data);
  }
});

// POST 请求
app.request({
  url: '/pets',
  method: 'POST',
  data: {
    name: '小白',
    species: '狗'
  },
  success: (data) => {
    console.log(data);
  }
});

// PUT 请求
app.request({
  url: '/pets/123',
  method: 'PUT',
  data: { name: '小黑' },
  success: (data) => {
    console.log(data);
  }
});

// DELETE 请求
app.request({
  url: '/pets/123',
  method: 'DELETE',
  success: (data) => {
    console.log(data);
  }
});
```

### 文件上传

```javascript
// 选择图片
wx.chooseImage({
  count: 1,
  sizeType: ['original', 'compressed'],
  sourceType: ['album', 'camera'],
  success: (res) => {
    const filePath = res.tempFilePaths[0];
    
    // 上传文件
    app.uploadFile({
      filePath,
      name: 'file',
      url: '/upload/image',
      success: (data) => {
        console.log('上传成功:', data.url);
      }
    });
  }
});
```

### 数据存储

```javascript
// 保存数据
wx.setStorageSync('token', 'your_token');
wx.setStorageSync('userInfo', { id: 1, name: 'John' });

// 读取数据
const token = wx.getStorageSync('token');
const userInfo = wx.getStorageSync('userInfo');

// 删除数据
wx.removeStorageSync('token');

// 清空所有数据
wx.clearStorageSync();
```

### 页面导航

```javascript
// 打开新页面
wx.navigateTo({
  url: '/pages/pet/detail?id=123'
});

// 返回上一页
wx.navigateBack();

// 返回指定页数
wx.navigateBack({
  delta: 2
});

// 重定向
wx.redirectTo({
  url: '/pages/index/index'
});

// 切换 Tab
wx.switchTab({
  url: '/pages/pet/list'
});
```

### 用户交互

```javascript
// 显示提示
wx.showToast({
  title: '操作成功',
  icon: 'success',
  duration: 2000
});

// 显示加载
wx.showLoading({
  title: '加载中...'
});
wx.hideLoading();

// 显示模态框
wx.showModal({
  title: '提示',
  content: '确定删除吗？',
  confirmText: '确定',
  cancelText: '取消',
  success: (res) => {
    if (res.confirm) {
      // 用户点击确定
    }
  }
});

// 显示操作菜单
wx.showActionSheet({
  itemList: ['选项1', '选项2', '选项3'],
  success: (res) => {
    console.log('选择了:', res.tapIndex);
  }
});
```

### 位置服务

```javascript
// 获取当前位置
wx.getLocation({
  type: 'wgs84',
  success: (res) => {
    console.log('纬度:', res.latitude);
    console.log('经度:', res.longitude);
  }
});

// 选择位置
wx.chooseLocation({
  success: (res) => {
    console.log('位置名称:', res.name);
    console.log('地址:', res.address);
    console.log('纬度:', res.latitude);
    console.log('经度:', res.longitude);
  }
});
```

## 页面生命周期

```javascript
Page({
  onLoad(options) {
    // 页面加载时执行一次
    // options 包含页面参数
  },

  onShow() {
    // 页面显示时执行
    // 每次进入页面都会执行
  },

  onReady() {
    // 页面初次渲染完成时执行
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
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    // 上拉加载更多时执行
  },

  onShareAppMessage() {
    // 分享时执行
    return {
      title: '分享标题',
      path: '/pages/index/index'
    };
  }
});
```

## 数据绑定语法

### WXML

```wxml
<!-- 文本插值 -->
<text>{{message}}</text>

<!-- 属性绑定 -->
<image src="{{imageUrl}}" />
<view data-id="{{id}}"></view>

<!-- 条件渲染 -->
<view wx:if="{{condition}}">显示</view>
<view wx:elif="{{condition2}}">显示2</view>
<view wx:else>都不显示</view>

<!-- 列表渲染 -->
<view wx:for="{{items}}" wx:key="id">
  {{item.name}}
</view>

<!-- 索引 -->
<view wx:for="{{items}}" wx:key="*this" wx:for-index="idx" wx:for-item="itemName">
  {{idx}}: {{itemName}}
</view>

<!-- 事件绑定 -->
<button bindtap="onTap" data-id="123">点击</button>
<input bindinput="onInput" />
<view bindtouchstart="onTouchStart">触摸</view>

<!-- 双向绑定 -->
<input model:value="{{inputValue}}" />
```

### JavaScript

```javascript
// 更新数据
this.setData({
  message: 'Hello',
  imageUrl: 'https://...',
  items: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ]
});

// 获取数据
const message = this.data.message;
const items = this.data.items;

// 深层更新
this.setData({
  'user.name': 'John',
  'items[0].name': 'New Name'
});
```

## 常用 API

### 系统信息

```javascript
// 获取系统信息
const systemInfo = wx.getSystemInfoSync();
console.log('屏幕宽度:', systemInfo.screenWidth);
console.log('屏幕高度:', systemInfo.screenHeight);
console.log('设备像素比:', systemInfo.devicePixelRatio);
console.log('微信版本:', systemInfo.version);

// 获取菜单按钮信息
const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
console.log('菜单按钮位置:', menuButtonInfo);
```

### 网络状态

```javascript
// 获取网络类型
wx.getNetworkType({
  success: (res) => {
    console.log('网络类型:', res.networkType);
    // 'wifi', '2g', '3g', '4g', '5g', 'unknown', 'none'
  }
});

// 监听网络状态变化
wx.onNetworkStatusChange((res) => {
  console.log('网络连接:', res.isConnected);
  console.log('网络类型:', res.networkType);
});
```

### 剪贴板

```javascript
// 复制到剪贴板
wx.setClipboardData({
  data: 'Hello World',
  success: () => {
    console.log('复制成功');
  }
});

// 读取剪贴板
wx.getClipboardData({
  success: (res) => {
    console.log('剪贴板内容:', res.data);
  }
});
```

## 样式技巧

### 常用 CSS

```css
/* 弹性布局 */
.flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 网格布局 */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* 文本省略 */
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 阴影 */
.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 圆角 */
.rounded {
  border-radius: 8px;
}

.rounded-full {
  border-radius: 50%;
}

/* 过渡 */
.transition {
  transition: all 0.3s ease;
}
```

## 调试技巧

### 控制台输出

```javascript
// 普通日志
console.log('信息:', data);

// 警告
console.warn('警告:', warning);

// 错误
console.error('错误:', error);

// 表格输出
console.table([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
]);

// 分组
console.group('分组名称');
console.log('内容1');
console.log('内容2');
console.groupEnd();
```

### 性能测试

```javascript
// 测量执行时间
console.time('myTimer');
// ... 执行代码 ...
console.timeEnd('myTimer');

// 计数
console.count('myCounter');
console.count('myCounter');
console.countReset('myCounter');
```

## 常见错误处理

### 网络错误

```javascript
app.request({
  url: '/api/data',
  success: (data) => {
    // 处理成功
  },
  fail: (err) => {
    // 处理失败
    if (err.errMsg.includes('request:fail')) {
      wx.showToast({
        title: '网络连接失败',
        icon: 'error'
      });
    }
  }
});
```

### 权限错误

```javascript
wx.getLocation({
  success: (res) => {
    // 获取位置成功
  },
  fail: (err) => {
    if (err.errMsg.includes('getLocation:fail')) {
      wx.showModal({
        title: '需要位置权限',
        content: '请在设置中开启位置权限',
        confirmText: '去设置'
      });
    }
  }
});
```

## 性能优化

### 列表优化

```wxml
<!-- 使用 wx:key 优化列表渲染 -->
<view wx:for="{{items}}" wx:key="id">
  {{item.name}}
</view>

<!-- 避免在列表中使用复杂计算 -->
<!-- ❌ 不好 -->
<view wx:for="{{items}}">
  {{item.price * item.quantity}}
</view>

<!-- ✅ 好 -->
<view wx:for="{{items}}">
  {{item.total}}
</view>
```

### 图片优化

```wxml
<!-- 设置图片尺寸 -->
<image src="{{imageUrl}}" mode="aspectFill" style="width: 100px; height: 100px;" />

<!-- 使用 lazy-load 延迟加载 -->
<image src="{{imageUrl}}" lazy-load="true" />
```

### 数据优化

```javascript
// 避免频繁的 setData
// ❌ 不好
for (let i = 0; i < 100; i++) {
  this.setData({
    [`items[${i}].status`]: 'done'
  });
}

// ✅ 好
const items = this.data.items;
items.forEach(item => {
  item.status = 'done';
});
this.setData({ items });
```

## 快速命令

### 微信开发者工具快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+K | 打开命令面板 |
| Ctrl+P | 快速打开文件 |
| Ctrl+Shift+P | 打开设置 |
| F12 | 打开调试器 |
| Ctrl+Shift+D | 清空缓存 |
| Ctrl+Shift+R | 重新编译 |

## 资源链接

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信小程序 API](https://developers.weixin.qq.com/miniprogram/dev/api/)
- [WXML 文档](https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/)
- [WXSS 文档](https://developers.weixin.qq.com/miniprogram/dev/reference/wxss/)

---

**最后更新**：2025-01-01
