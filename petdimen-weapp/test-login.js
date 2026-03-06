/**
 * 登录功能测试脚本
 * 在 WeChat Developer Tools 的控制台中执行这些代码
 */

// ========== 测试 1: 检查登录状态 ==========
console.log('========== 测试 1: 检查登录状态 ==========');
const app = getApp();
console.log('Token:', app.globalData.token);
console.log('UserInfo:', app.globalData.userInfo);
console.log('API Base URL:', app.globalData.apiBaseUrl);

// ========== 测试 2: 检查本地存储 ==========
console.log('\n========== 测试 2: 检查本地存储 ==========');
const token = wx.getStorageSync('token');
const userInfo = wx.getStorageSync('userInfo');
console.log('本地存储 Token:', token);
console.log('本地存储 UserInfo:', userInfo);

// ========== 测试 3: 测试网络连接 ==========
console.log('\n========== 测试 3: 测试网络连接 ==========');
wx.getNetworkType({
  success: (res) => {
    console.log('网络类型:', res.networkType);
  }
});

// ========== 测试 4: 测试 API 连接 ==========
console.log('\n========== 测试 4: 测试 API 连接 ==========');
wx.request({
  url: 'http://localhost:8080/api/auth/login',
  method: 'POST',
  data: {
    username: 'testuser',
    password: 'test123'
  },
  header: {
    'Content-Type': 'application/json'
  },
  success: (res) => {
    console.log('API 响应状态码:', res.statusCode);
    console.log('API 响应数据:', res.data);
  },
  fail: (err) => {
    console.error('API 请求失败:', err);
  }
});

// ========== 测试 5: 测试页面跳转 ==========
console.log('\n========== 测试 5: 测试页面跳转 ==========');
// 注意：这会实际跳转页面，如果不想跳转，注释掉这段代码
// wx.redirectTo({
//   url: '/pages/index/index',
//   success: () => {
//     console.log('跳转成功');
//   },
//   fail: (err) => {
//     console.error('跳转失败:', err);
//   }
// });

// ========== 测试 6: 测试登录流程 ==========
console.log('\n========== 测试 6: 测试登录流程 ==========');
console.log('执行完整的登录流程测试...');

// 模拟登录
app.request({
  url: '/auth/login',
  method: 'POST',
  data: {
    username: 'testuser',
    password: 'test123'
  },
  success: (data) => {
    console.log('登录成功!');
    console.log('Token:', data.token);
    console.log('User:', data.user);
    
    // 保存数据
    wx.setStorageSync('token', data.token);
    wx.setStorageSync('userInfo', data.user);
    app.globalData.token = data.token;
    app.globalData.userInfo = data.user;
    
    console.log('数据已保存');
    console.log('本地存储 Token:', wx.getStorageSync('token'));
    console.log('全局 Token:', app.globalData.token);
  },
  fail: (err) => {
    console.error('登录失败:', err);
  }
});

// ========== 测试 7: 检查首页是否存在 ==========
console.log('\n========== 测试 7: 检查首页是否存在 ==========');
wx.getSystemInfo({
  success: (res) => {
    console.log('系统信息:', res);
  }
});

// ========== 测试 8: 清除登录信息 ==========
console.log('\n========== 测试 8: 清除登录信息 ==========');
// 注意：执行这个会清除登录信息，需要重新登录
// wx.removeStorageSync('token');
// wx.removeStorageSync('userInfo');
// app.globalData.token = null;
// app.globalData.userInfo = null;
// console.log('登录信息已清除');

console.log('\n========== 测试完成 ==========');
