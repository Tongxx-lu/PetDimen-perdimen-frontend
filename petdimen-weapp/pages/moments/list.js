const app = getApp();

Page({
  data: {
    moments: [],
    activeFilter: 'all',
    loading: true,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadMoments();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.setData({
      moments: [],
      page: 1,
      hasMore: true
    });
    this.loadMoments();
  },

  loadMoments() {
    const { activeFilter, page, pageSize } = this.data;
    
    this.setData({ loading: page === 1 });

    let url = `/social/moments?page=${page}&size=${pageSize}`;
    
    if (activeFilter === 'following') {
      url += '&type=following';
    } else if (activeFilter === 'nearby') {
      url += '&type=nearby';
    }

    app.request({
      url,
      method: 'GET',
      success: (data) => {
        const newMoments = (data.records || []).map(m => ({
          ...m,
          createdAt: this.formatTime(m.createdAt),
          liked: m.liked || false
        }));

        const moments = page === 1 ? newMoments : [...this.data.moments, ...newMoments];

        this.setData({
          moments,
          loading: false,
          loadingMore: false,
          hasMore: data.records && data.records.length === pageSize
        });
      },
      fail: (err) => {
        console.error('加载动态失败:', err);
        this.setData({
          loading: false,
          loadingMore: false
        });
        
        if (page === 1) {
          wx.showToast({
            title: '加载失败',
            icon: 'error'
          });
        }
      }
    });
  },

  filterMoments(e) {
    const filter = e.currentTarget.dataset.filter;
    
    this.setData({
      activeFilter: filter,
      moments: [],
      page: 1,
      hasMore: true,
      loading: true
    });

    this.loadMoments();
  },

  loadMore() {
    if (this.data.loadingMore || !this.data.hasMore) {
      return;
    }

    this.setData({
      page: this.data.page + 1,
      loadingMore: true
    });

    this.loadMoments();
  },

  toggleLike(e) {
    const momentId = e.currentTarget.dataset.id;
    const moments = this.data.moments;
    const moment = moments.find(m => m.id === momentId);

    if (!moment) return;

    // 使用正确的接口路径：POST /api/social/moments/{id}/interact
    const requestData = {
      type: moment.liked ? 'unlike' : 'like'
    };

    app.request({
      url: `/social/moments/${momentId}/interact`,
      method: 'POST',
      data: requestData,
      success: (data) => {
        moment.liked = !moment.liked;
        moment.likeCount = moment.liked ? moment.likeCount + 1 : moment.likeCount - 1;
        this.setData({ moments });
      },
      fail: (err) => {
        console.error('操作失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        });
      }
    });
  },

  goComment(e) {
    const momentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/moments/detail?id=${momentId}`
    });
  },

  shareMoment(e) {
    const momentId = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['分享到微信', '分享到朋友圈', '复制链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showToast({
            title: '分享到微信',
            icon: 'success'
          });
        } else if (res.tapIndex === 1) {
          wx.showToast({
            title: '分享到朋友圈',
            icon: 'success'
          });
        } else if (res.tapIndex === 2) {
          wx.setClipboardData({
            data: `https://petdimen.com/moments/${momentId}`,
            success: () => {
              wx.showToast({
                title: '链接已复制',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = this.data.moments
      .flatMap(m => m.media || [])
      .map(m => m.url);

    wx.previewImage({
      urls,
      current: url
    });
  },

  showMomentMenu(e) {
    const momentId = e.currentTarget.dataset.id;
    const moment = this.data.moments.find(m => m.id === momentId);

    if (!moment) return;

    const isOwner = moment.userId === app.globalData.userInfo?.id;

    const items = isOwner ? ['删除'] : ['举报'];

    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        if (isOwner && res.tapIndex === 0) {
          this.deleteMoment(momentId);
        } else if (!isOwner && res.tapIndex === 0) {
          this.reportMoment(momentId);
        }
      }
    });
  },

  deleteMoment(momentId) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条动态吗？',
      confirmText: '删除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });

          app.request({
            url: `/social/moments/${momentId}`,
            method: 'DELETE',
            success: (data) => {
              wx.hideLoading();
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });

              const moments = this.data.moments.filter(m => m.id !== momentId);
              this.setData({ moments });
            },
            fail: (err) => {
              wx.hideLoading();
              wx.showToast({
                title: '删除失败',
                icon: 'error'
              });
            }
          });
        }
      }
    });
  },

  reportMoment(momentId) {
    wx.showModal({
      title: '举报动态',
      content: '请选择举报原因',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '举报成功',
            icon: 'success'
          });
        }
      }
    });
  },

  goPublish() {
    wx.navigateTo({
      url: '/pages/moments/publish'
    });
  },

  formatTime(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return '刚刚';
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
});
