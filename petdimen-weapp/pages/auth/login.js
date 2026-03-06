const app = getApp();

Page({
  data: {
    activeTab: 'wechat',
    username: '',
    password: '',
    wechatLoginLoading: false,
    accountLoginLoading: false,
    accountError: '',
    showLoading: false,
    loadingText: '登录中...'
  },

  onLoad() {
    // 检查是否已登录
    if (app.globalData.token) {
      wx.redirectTo({ url: '/pages/index/index' });
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      accountError: ''
    });
  },

  // 处理用户名输入
  handleUsernameInput(e) {
    this.setData({
      username: e.detail.value,
      accountError: ''
    });
  },

  // 处理密码输入
  handlePasswordInput(e) {
    this.setData({
      password: e.detail.value,
      accountError: ''
    });
  },

  // 获取手机号并登录
  handleGetPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      this.wechatLoginWithPhone(e.detail.code);
    } else {
      wx.showToast({
        title: '获取手机号失败',
        icon: 'error'
      });
    }
  },

  // 微信登录（使用 wx.login）
  wechatLoginWithPhone(phoneCode) {
    this.setData({ wechatLoginLoading: true });

    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用后端微信登录接口
          app.request({
            url: '/auth/weapp/login',
            method: 'POST',
            data: {
              code: res.code,
              phoneCode: phoneCode
            },
            success: (data) => {
              console.log('微信登录成功:', data);
              
              // 后端返回的是 AuthResponse 对象：{ token, userId, username, nickname }
              const { token, userId, username, nickname } = data;
              
              // 构建用户信息对象
              const userInfo = {
                id: userId,
                username: username,
                nickname: nickname
              };

              console.log('Token:', token);
              console.log('UserInfo:', userInfo);
              
              // 保存登录信息
              wx.setStorageSync('token', token);
              wx.setStorageSync('userInfo', userInfo);
              app.globalData.token = token;
              app.globalData.userInfo = userInfo;

              console.log('本地存储 Token:', wx.getStorageSync('token'));
              console.log('本地存储 UserInfo:', wx.getStorageSync('userInfo'));

              wx.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 1500
              });

              // 延迟跳转，确保数据保存
              setTimeout(() => {
                console.log('执行跳转到首页');
                // 首页在 tabBar 中，需要使用 switchTab
                wx.switchTab({ 
                  url: '/pages/index/index',
                  success: () => {
                    console.log('跳转成功');
                  },
                  fail: (err) => {
                    console.error('跳转失败:', err);
                  }
                });
              }, 1500);
            },
            fail: (err) => {
              console.error('微信登录失败:', err);
              this.setData({ wechatLoginLoading: false });
              
              const errorMsg = err.message || '微信登录失败';
              wx.showToast({
                title: errorMsg,
                icon: 'error'
              });

              // 如果是微信 code 无效，提示用户使用账号登录
              if (err.code === 'AUTH_4004') {
                wx.showModal({
                  title: '微信登录失败',
                  content: '微信登录暂时不可用，请使用账号登录',
                  showCancel: false,
                  success: () => {
                    this.setData({ activeTab: 'account' });
                  }
                });
              }
            }
          });
        } else {
          console.error('wx.login 失败:', res);
          this.setData({ wechatLoginLoading: false });
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        console.error('wx.login 请求失败:', err);
        this.setData({ wechatLoginLoading: false });
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'error'
        });
      }
    });
  },

  // 账号登录
  handleAccountLogin() {
    const { username, password } = this.data;

    // 验证输入
    if (!username.trim()) {
      this.setData({ accountError: '请输入用户名' });
      return;
    }

    if (!password.trim()) {
      this.setData({ accountError: '请输入密码' });
      return;
    }

    if (password.length < 6) {
      this.setData({ accountError: '密码长度不能少于 6 位' });
      return;
    }

    this.setData({ accountLoginLoading: true });

    // 调用后端登录接口
    app.request({
      url: '/auth/login',
      method: 'POST',
      data: {
        username: username.trim(),
        password: password
      },
      success: (data) => {
        console.log('账号登录成功:', data);
        
        // 后端返回的是 AuthResponse 对象：{ token, userId, username, nickname }
        const { token, userId, username, nickname } = data;
        
        // 构建用户信息对象
        const userInfo = {
          id: userId,
          username: username,
          nickname: nickname
        };

        console.log('Token:', token);
        console.log('UserInfo:', userInfo);

        // 保存登录信息
        wx.setStorageSync('token', token);
        wx.setStorageSync('userInfo', userInfo);
        app.globalData.token = token;
        app.globalData.userInfo = userInfo;

        console.log('本地存储 Token:', wx.getStorageSync('token'));
        console.log('本地存储 UserInfo:', wx.getStorageSync('userInfo'));

        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });

        // 延迟跳转，确保数据保存
        setTimeout(() => {
          console.log('执行跳转到首页');
          // 首页在 tabBar 中，需要使用 switchTab
          wx.switchTab({ 
            url: '/pages/index/index',
            success: () => {
              console.log('跳转成功');
            },
            fail: (err) => {
              console.error('跳转失败:', err);
            }
          });
        }, 1500);
      },
      fail: (err) => {
        console.error('账号登录失败:', err);
        this.setData({ accountLoginLoading: false });

        let errorMsg = '登录失败，请重试';
        if (err.code === 'USER_404') {
          errorMsg = '用户不存在';
        } else if (err.code === 'USER_4001') {
          errorMsg = '用户名或密码错误';
        } else if (err.message) {
          errorMsg = err.message;
        }

        this.setData({ accountError: errorMsg });
      }
    });
  },

  // 导航到注册页面
  navigateToRegister() {
    wx.navigateTo({ url: '/pages/auth/register' });
  }
});
