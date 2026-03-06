const app = getApp();

Page({
  data: {
    petId: null,
    pet: null,
    behaviors: [],
    reminders: [],
    stats: {
      behaviorCount: 0,
      reminderCount: 0,
      momentCount: 0,
      daysSinceAdded: 0
    },
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ petId: options.id });
      this.loadPetDetail();
    }
  },

  onShow() {
    // 每次显示页面时刷新数据
    if (this.data.petId) {
      this.loadPetDetail();
    }
  },

  loadPetDetail() {
    this.setData({ loading: true });

    app.request({
      url: `/pets/${this.data.petId}`,
      method: 'GET',
      success: (data) => {
        // 格式化数据
        const pet = data;
        pet.age = this.calculateAge(pet.birthDate);
        
        this.setData({
          pet,
          loading: false
        });

        // 加载相关数据
        this.loadBehaviors();
        this.loadReminders();
        this.loadStats();
      },
      fail: (err) => {
        console.error('加载宠物详情失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      }
    });
  },

  loadBehaviors() {
    app.request({
      url: `/behaviors?petId=${this.data.petId}&page=1&size=5`,
      method: 'GET',
      success: (data) => {
        const behaviors = (data.records || []).map(b => ({
          ...b,
          happenedAt: this.formatDateTime(b.happenedAt),
          typeName: this.getBehaviorTypeName(b.type)
        }));

        this.setData({ behaviors });
      },
      fail: (err) => {
        console.error('加载行为记录失败:', err);
      }
    });
  },

  loadReminders() {
    app.request({
      url: `/health/reminders?petId=${this.data.petId}`,
      method: 'GET',
      success: (data) => {
        const reminders = (data.records || []).map(r => ({
          ...r,
          remindDate: this.formatDate(r.remindDate)
        }));

        this.setData({ reminders });
      },
      fail: (err) => {
        console.error('加载健康提醒失败:', err);
      }
    });
  },

  loadStats() {
    // 注意：后端没有 /pets/{id}/stats 接口
    // 使用已加载的数据计算统计信息
    const stats = {
      behaviorCount: this.data.behaviors.length,
      reminderCount: this.data.reminders.length,
      momentCount: 0, // 需要单独查询
      daysSinceAdded: this.calculateDaysSince(this.data.pet.createdAt)
    };

    this.setData({ stats });
  },

  calculateAge(birthDate) {
    if (!birthDate) return 0;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  calculateDaysSince(date) {
    if (!date) return 0;
    
    const today = new Date();
    const startDate = new Date(date);
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },

  formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  formatDateTime(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  getBehaviorTypeName(type) {
    const typeMap = {
      'feeding': '喂食',
      'walking': '遛弯',
      'playing': '玩耍',
      'bathing': '洗澡',
      'grooming': '美容',
      'defecation': '排便',
      'urination': '排尿',
      'sleeping': '睡眠',
      'eating': '进食',
      'drinking': '喝水',
      'vomiting': '呕吐',
      'other': '其他'
    };
    
    return typeMap[type] || type;
  },

  onEdit() {
    wx.navigateTo({
      url: `/pages/pet/add?id=${this.data.petId}`
    });
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${this.data.pet.name} 吗？`,
      confirmText: '删除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.deletePet();
        }
      }
    });
  },

  deletePet() {
    wx.showLoading({ title: '删除中...' });

    app.request({
      url: `/pets/${this.data.petId}`,
      method: 'DELETE',
      success: (data) => {
        wx.hideLoading();
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '删除失败',
          icon: 'error'
        });
      }
    });
  },

  recordBehavior() {
    wx.navigateTo({
      url: `/pages/behavior/record?petId=${this.data.petId}`
    });
  },

  addReminder() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  viewAllBehaviors() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  viewAllReminders() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  toggleReminder(e) {
    const reminderId = e.currentTarget.dataset.id;
    const reminders = this.data.reminders;
    const reminder = reminders.find(r => r.id === reminderId);

    if (reminder) {
      const newStatus = reminder.status === 'completed' ? 'pending' : 'completed';

      app.request({
        url: `/health/reminders/${reminderId}`,
        method: 'PUT',
        data: { status: newStatus },
        success: (data) => {
          reminder.status = newStatus;
          this.setData({ reminders });
        },
        fail: (err) => {
          console.error('更新提醒失败:', err);
        }
      });
    }
  },

  loadPetDetail() {
    this.setData({ loading: true });

    app.request({
      url: `/pets/${this.data.petId}`,
      method: 'GET',
      success: (data) => {
        const pet = data;
        pet.age = this.calculateAge(pet.birthDate);
        
        this.setData({
          pet,
          loading: false
        });

        this.loadBehaviors();
        this.loadReminders();
        this.loadStats();
      },
      fail: (err) => {
        console.error('加载宠物详情失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      }
    });
  }
});
