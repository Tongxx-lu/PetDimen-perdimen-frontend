const app = getApp();

Page({
  data: {
    userInfo: {},
    currentTime: '',
    petCount: 0,
    pets: [],
    reminders: [],
    moments: [],
    loading: true
  },

  onLoad() {
    this.updateTime();
    // 使用 setInterval 而不是自定义方法
    this.timeIntervalId = setInterval(() => {
      this.updateTime();
    }, 1000);
    
    // 异步加载数据
    setTimeout(() => {
      this.loadData();
    }, 0);
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadData();
  },

  onUnload() {
    // 清理定时器
    if (this.timeIntervalId) {
      clearInterval(this.timeIntervalId);
    }
  },

  updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    this.setData({
      currentTime: timeStr
    });
  },

  loadData() {
    this.setData({ loading: true });
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }

    // 并行加载数据，使用 Promise.allSettled 避免单个请求失败导致全部失败
    Promise.allSettled([
      this.loadPets(),
      this.loadReminders(),
      this.loadMoments()
    ]).then(() => {
      this.setData({ loading: false });
    }).catch((err) => {
      console.error('加载数据失败:', err);
      this.setData({ loading: false });
    });
  },

  loadPets() {
    return new Promise((resolve, reject) => {
      app.request({
        url: '/pets?page=1&size=5',
        method: 'GET',
        success: (data) => {
          const pets = data.records || [];
          this.setData({
            pets: pets.slice(0, 3),
            petCount: data.total || 0
          });
          resolve();
        },
        fail: (err) => {
          console.error('加载宠物列表失败:', err);
          reject(err);
        }
      });
    });
  },

  loadReminders() {
    return new Promise((resolve, reject) => {
      app.request({
        url: '/health/reminders?enabled=1',
        method: 'GET',
        success: (data) => {
          const reminders = (data || []).map(item => ({
            id: item.id,
            petName: item.petName,
            type: this.getReminderType(item.type),
            icon: this.getReminderIcon(item.type),
            nextTime: this.formatTime(item.nextTime),
            status: item.enabled ? 'active' : 'inactive',
            statusText: item.enabled ? '已启用' : '已禁用'
          }));
          this.setData({ reminders });
          resolve();
        },
        fail: (err) => {
          console.error('加载健康提醒失败:', err);
          // 不拒绝，允许部分加载失败
          resolve();
        }
      });
    });
  },

  loadMoments() {
    return new Promise((resolve, reject) => {
      app.request({
        url: '/moments?page=1&size=5',
        method: 'GET',
        success: (data) => {
          const moments = (data.records || []).map(item => ({
            id: item.id,
            userAvatar: item.userAvatar,
            userName: item.userName,
            createdAt: this.formatTime(item.createdAt),
            content: item.content,
            media: item.media || [],
            likeCount: item.likeCount || 0,
            commentCount: item.commentCount || 0,
            shareCount: item.shareCount || 0
          }));
          this.setData({ moments });
          resolve();
        },
        fail: (err) => {
          console.error('加载动态失败:', err);
          // 不拒绝，允许部分加载失败
          resolve();
        }
      });
    });
  },

  getReminderType(type) {
    const typeMap = {
      'vaccination': '疫苗接种',
      'deworming': '驱虫',
      'bathing': '洗澡',
      'grooming': '美容',
      'checkup': '体检',
      'feeding': '喂食'
    };
    return typeMap[type] || type;
  },

  getReminderIcon(type) {
    const iconMap = {
      'vaccination': '💉',
      'deworming': '🐛',
      'bathing': '🛁',
      'grooming': '✂️',
      'checkup': '🏥',
      'feeding': '🍖'
    };
    return iconMap[type] || '📋';
  },

  formatTime(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date - now;
    
    // 计算时间差
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}天后`;
    } else if (hours > 0) {
      return `${hours}小时后`;
    } else {
      return '即将开始';
    }
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  navigateToPetDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/pet/detail?id=${id}`
    });
  },

  navigateToMoment(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/moments/list?id=${id}`
    });
  },

});
