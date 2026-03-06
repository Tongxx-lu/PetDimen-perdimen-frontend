const app = getApp();

Page({
  data: {
    userInfo: {
      id: '',
      nickname: '',
      avatar: '',
      bio: ''
    },
    stats: {
      petCount: 0,
      momentCount: 0,
      followCount: 0,
      followerCount: 0
    }
  },

  onLoad() {
    this.loadUserProfile();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadUserProfile();
  },

  loadUserProfile() {
    const userInfo = app.globalData.userInfo || {};
    
    this.setData({ userInfo });

    // 注意：后端没有 /user/stats 接口
    // 使用默认值或从其他接口获取
    this.setData({
      stats: {
        petCount: 0,
        momentCount: 0,
        followCount: 0,
        followerCount: 0
      }
    });

    // 可以调用 /pets 接口获取宠物数量
    app.request({
      url: '/pets?page=1&size=1',
      method: 'GET',
      success: (data) => {
        this.setData({
          'stats.petCount': data.total || 0
        });
      },
      fail: (err) => {
        console.error('加载宠物数量失败:', err);
      }
    });
  },

  changeAvatar() {
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
          url: '/upload/image',
          success: (data) => {
            wx.hideLoading();
            
            // 更新头像
            app.request({
              url: '/user/me',
              method: 'PUT',
              data: { avatarUrl: data.url },
              success: (res) => {
                const userInfo = this.data.userInfo;
                userInfo.avatar = data.url;
                this.setData({ userInfo });
                
                app.globalData.userInfo = userInfo;
                
                wx.showToast({
                  title: '头像更新成功',
                  icon: 'success'
                });
              },
              fail: (err) => {
                wx.showToast({
                  title: '更新失败',
                  icon: 'error'
                });
              }
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
  },

  goSettings() {
    wx.navigateTo({
      url: '/pages/user/settings'
    });
  },

  goMyPets() {
    wx.switchTab({
      url: '/pages/pet/list'
    });
  },

  goMyMoments() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goFavorites() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goFollowing() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goFollowers() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goAccountSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goHelp() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goAbout() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          
          // 清除全局数据
          app.globalData.userInfo = null;
          app.globalData.token = null;
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });

          // 返回首页
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      }
    });
  }
});
