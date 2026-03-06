App({
  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 初始化API基础URL
    this.globalData.apiBaseUrl = 'http://localhost:8080/api';
    
    // 异步检查登录状态，不阻塞启动
    this.checkLogin();
  },

  onShow() {
    // 应用显示时的处理
  },

  onHide() {
    // 应用隐藏时的处理
  },

  checkLogin() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    } else {
      // 异步执行登录，不阻塞应用启动
      wx.nextTick(() => {
        this.autoLogin();
      });
    }
  },

  autoLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用后端API进行登录
          this.wechatLogin(res.code);
        }
      },
      fail: (err) => {
        console.error('微信登录失败:', err);
      }
    });
  },

  wechatLogin(code) {
    wx.request({
      url: `${this.globalData.apiBaseUrl}/auth/weapp/login`,
      method: 'POST',
      data: {
        code: code
      },
      success: (res) => {
        if (res.data && res.data.code === 'OK' && res.data.data) {
          const { token, userId, username, nickname } = res.data.data;
          const user = { id: userId, username, nickname };
          wx.setStorageSync('token', token);
          wx.setStorageSync('userInfo', user);
          this.globalData.token = token;
          this.globalData.userInfo = user;
          console.log('微信登录成功:', { userId, username });
        } else {
          console.error('微信登录失败:', res.data);
        }
      },
      fail: (err) => {
        console.error('微信登录请求失败:', err);
      }
    });
  },

  logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.token = null;
    this.globalData.userInfo = null;
    console.log('用户已登出');
  },

  // 网络请求封装
  request(options) {
    const { url, method = 'GET', data, success, fail, complete } = options;
    const token = this.globalData.token;
    
    const header = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: `${this.globalData.apiBaseUrl}${url}`,
      method,
      data,
      header,
      timeout: 10000,
      success: (res) => {
        const { code, message, data: responseData } = res.data || {};
        
        console.log('API 响应:', { code, message, url, statusCode: res.statusCode });
        
        if (code === 'OK') {
          success && success(responseData);
        } else if (code === 'AUTH_401') {
          // 未认证，重新登录
          console.warn('Token 无效或已过期，重新登录');
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'error'
          });
          this.autoLogin();
          fail && fail(res.data);
        } else if (code === 'AUTH_403' || code === 'PET_403' || code === 'SOCIAL_4032' || code === 'USER_4031') {
          // 权限不足或禁用
          console.warn('权限不足:', { code, message });
          wx.showToast({
            title: message || '权限不足',
            icon: 'error'
          });
          fail && fail(res.data);
        } else {
          // 其他错误
          console.error('API 错误:', { code, message });
          fail && fail(res.data);
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', err);
        fail && fail(err);
      },
      complete
    });
  },

  // 上传文件
  uploadFile(options) {
    const { filePath, name, url, success, fail } = options;
    const token = this.globalData.token;
    
    const header = {};
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    wx.uploadFile({
      url: `${this.globalData.apiBaseUrl}${url}`,
      filePath,
      name,
      header,
      timeout: 30000,
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data && data.code === 'OK') {
            success && success(data.data);
          } else {
            fail && fail(data);
          }
        } catch (err) {
          console.error('上传文件解析失败:', err);
          fail && fail(err);
        }
      },
      fail: (err) => {
        console.error('上传文件失败:', err);
        fail && fail(err);
      }
    });
  },

  globalData: {
    token: null,
    userInfo: null,
    apiBaseUrl: '',
    systemInfo: null
  }
});
