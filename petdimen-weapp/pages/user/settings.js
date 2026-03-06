const app = getApp();

Page({
  data: {
    settings: {
      nickname: '',
      phone: '',
      avatarUrl: '',
      gender: 0,
      // 以下是前端本地设置，不会发送到后端
      allowMessage: true,
      showLocation: true,
      allowNotification: true,
      notifyLike: true,
      notifyComment: true,
      notifyFollow: true,
      notifySystem: true
    },
    genderOptions: ['未知', '男', '女'],
    genderIndex: 0,
    cacheSize: '0 MB',
    saving: false
  },

  onLoad() {
    this.loadSettings();
    this.calculateCacheSize();
  },

  loadSettings() {
    // 使用 /user/me 接口获取用户信息
    app.request({
      url: '/user/me',
      method: 'GET',
      success: (data) => {
        // 从用户信息中提取设置
        const settings = {
          nickname: data.nickname || '',
          phone: data.phone || '',
          avatarUrl: data.avatarUrl || '',
          gender: data.gender || 0,
          // 以下是默认设置，后端可能没有存储
          allowMessage: true,
          showLocation: true,
          allowNotification: true,
          notifyLike: true,
          notifyComment: true,
          notifyFollow: true,
          notifySystem: true
        };

        // 设置性别选择器的索引
        const genderIndex = data.gender || 0;

        this.setData({
          settings,
          genderIndex
        });
      },
      fail: (err) => {
        console.error('加载设置失败:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      }
    });
  },

  onSettingChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`settings.${field}`]: value
    });
  },

  onSwitchChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`settings.${field}`]: value
    });
  },

  onGenderChange(e) {
    const index = e.detail.value;
    this.setData({
      genderIndex: index,
      'settings.gender': parseInt(index)
    });
  },

  calculateCacheSize() {
    wx.getStorageInfo({
      success: (res) => {
        const size = (res.currentSize / 1024).toFixed(2);
        this.setData({
          cacheSize: `${size} MB`
        });
      }
    });
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      confirmText: '清除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });

          this.calculateCacheSize();
        }
      }
    });
  },

  checkUpdate() {
    wx.showToast({
      title: '已是最新版本',
      icon: 'success'
    });
  },

  goAbout() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  saveSettings() {
    this.setData({ saving: true });

    const { settings } = this.data;
    
    // 使用 /user/me 接口更新用户信息
    // 只发送后端支持的字段
    const data = {
      nickname: settings.nickname,
      phone: settings.phone,
      avatarUrl: settings.avatarUrl,
      gender: settings.gender
    };

    app.request({
      url: '/user/me',
      method: 'PUT',
      data,
      success: (res) => {
        this.setData({ saving: false });
        
        // 更新全局用户信息
        const userInfo = app.globalData.userInfo || {};
        userInfo.nickname = settings.nickname;
        userInfo.avatarUrl = settings.avatarUrl;
        app.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
        
        wx.showToast({
          title: '设置已保存',
          icon: 'success'
        });

        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: (err) => {
        this.setData({ saving: false });
        wx.showToast({
          title: '保存失败',
          icon: 'error'
        });
      }
    });
  },

  // 上传头像
  uploadAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths[0];
        
        wx.showLoading({ title: '上传中...' });
        
        app.uploadFile({
          filePath,
          name: 'file',
          url: '/upload/avatar',
          success: (data) => {
            wx.hideLoading();
            this.setData({
              'settings.avatarUrl': data.url
            });
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showToast({
              title: '上传失败',
              icon: 'error'
            });
          }
        });
      }
    });
  }
});
