const app = getApp();

Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    phone: '',
    agreeTerms: false,
    loading: false,
    error: '',
    usernameError: '',
    passwordError: '',
    confirmPasswordError: '',
    phoneError: '',
    agreementError: ''
  },

  onLoad() {
    // 检查是否已登录
    if (app.globalData.token) {
      wx.redirectTo({ url: '/pages/index/index' });
    }
  },

  // 处理用户名输入
  handleUsernameInput(e) {
    const username = e.detail.value;
    let error = '';

    if (username && (username.length < 3 || username.length > 20)) {
      error = '用户名长度应为 3-20 个字符';
    }

    this.setData({
      username,
      usernameError: error,
      error: ''
    });
  },

  // 处理密码输入
  handlePasswordInput(e) {
    const password = e.detail.value;
    let error = '';

    if (password && password.length < 6) {
      error = '密码长度不能少于 6 位';
    }

    this.setData({
      password,
      passwordError: error,
      error: ''
    });
  },

  // 处理确认密码输入
  handleConfirmPasswordInput(e) {
    const confirmPassword = e.detail.value;
    let error = '';

    if (confirmPassword && confirmPassword !== this.data.password) {
      error = '两次输入的密码不一致';
    }

    this.setData({
      confirmPassword,
      confirmPasswordError: error,
      error: ''
    });
  },

  // 处理昵称输入
  handleNicknameInput(e) {
    this.setData({
      nickname: e.detail.value,
      error: ''
    });
  },

  // 处理手机号输入
  handlePhoneInput(e) {
    const phone = e.detail.value;
    let error = '';

    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      error = '请输入有效的手机号';
    }

    this.setData({
      phone,
      phoneError: error,
      error: ''
    });
  },

  // 处理协议复选框
  handleAgreementChange(e) {
    this.setData({
      agreeTerms: e.detail.value.length > 0,
      agreementError: '',
      error: ''
    });
  },

  // 显示用户协议
  showTerms() {
    wx.showModal({
      title: '用户协议',
      content: '这是 PetDimen 的用户协议。\n\n用户在使用本服务前，应当阅读本协议。用户使用本服务即表示用户已经同意本协议的全部内容。',
      showCancel: false,
      confirmText: '我已阅读'
    });
  },

  // 显示隐私政策
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '这是 PetDimen 的隐私政策。\n\n我们重视您的隐私。本政策说明了我们如何收集、使用和保护您的个人信息。',
      showCancel: false,
      confirmText: '我已阅读'
    });
  },

  // 注册
  handleRegister() {
    const { username, password, confirmPassword, nickname, phone, agreeTerms } = this.data;

    // 验证输入
    if (!username.trim()) {
      this.setData({ error: '请输入用户名' });
      return;
    }

    if (username.length < 3 || username.length > 20) {
      this.setData({ error: '用户名长度应为 3-20 个字符' });
      return;
    }

    if (!password.trim()) {
      this.setData({ error: '请输入密码' });
      return;
    }

    if (password.length < 6) {
      this.setData({ error: '密码长度不能少于 6 位' });
      return;
    }

    if (password !== confirmPassword) {
      this.setData({ error: '两次输入的密码不一致' });
      return;
    }

    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      this.setData({ error: '请输入有效的手机号' });
      return;
    }

    if (!agreeTerms) {
      this.setData({ agreementError: '请同意用户协议和隐私政策' });
      return;
    }

    this.setData({ loading: true });

    // 调用后端注册接口
    app.request({
      url: '/auth/register',
      method: 'POST',
      data: {
        username: username.trim(),
        password: password,
        nickname: nickname.trim() || username.trim(),
        phone: phone.trim() || null
      },
      success: (data) => {
        console.log('注册成功:', data);
        
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
          title: '注册成功',
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
        console.error('注册失败:', err);
        this.setData({ loading: false });

        let errorMsg = '注册失败，请重试';
        if (err.code === 'AUTH_4002') {
          errorMsg = '用户名已存在';
        } else if (err.code === 'AUTH_4003') {
          errorMsg = '手机号已存在';
        } else if (err.message) {
          errorMsg = err.message;
        }

        this.setData({ error: errorMsg });
      }
    });
  },

  // 导航到登录页面
  navigateToLogin() {
    wx.navigateTo({ url: '/pages/auth/login' });
  }
});
