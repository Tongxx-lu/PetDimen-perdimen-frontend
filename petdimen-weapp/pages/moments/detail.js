const app = getApp();

Page({
  data: {
    momentId: null,
    moment: null,
    comments: [],
    commentText: '',
    loading: true,
    submittingComment: false,
    hasMoreComments: true,
    commentPage: 1,
    commentPageSize: 10
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ momentId: options.id });
      this.loadMomentDetail();
    }
  },

  loadMomentDetail() {
    this.setData({ loading: true });

    app.request({
      url: `/moments/${this.data.momentId}`,
      method: 'GET',
      success: (data) => {
        const moment = {
          ...data,
          createdAt: this.formatTime(data.createdAt),
          liked: data.liked || false
        };

        this.setData({
          moment,
          loading: false
        });

        this.loadComments();
      },
      fail: (err) => {
        console.error('加载动态详情失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      }
    });
  },

  loadComments() {
    const { momentId, commentPage, commentPageSize } = this.data;

    app.request({
      url: `/moments/${momentId}/comments?page=${commentPage}&size=${commentPageSize}`,
      method: 'GET',
      success: (data) => {
        const newComments = (data.records || []).map(c => ({
          ...c,
          createdAt: this.formatTime(c.createdAt),
          liked: c.liked || false
        }));

        const comments = commentPage === 1 ? newComments : [...this.data.comments, ...newComments];

        this.setData({
          comments,
          hasMoreComments: data.records && data.records.length === commentPageSize
        });
      },
      fail: (err) => {
        console.error('加载评论失败:', err);
      }
    });
  },

  loadMoreComments() {
    this.setData({
      commentPage: this.data.commentPage + 1
    });
    this.loadComments();
  },

  toggleLike() {
    const moment = this.data.moment;
    const action = moment.liked ? 'unlike' : 'like';

    app.request({
      url: `/moments/${moment.id}/${action}`,
      method: 'POST',
      success: (data) => {
        moment.liked = !moment.liked;
        moment.likeCount = moment.liked ? moment.likeCount + 1 : moment.likeCount - 1;
        this.setData({ moment });
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

  likeComment(e) {
    const commentId = e.currentTarget.dataset.id;
    const comments = this.data.comments;
    const comment = comments.find(c => c.id === commentId);

    if (!comment) return;

    const action = comment.liked ? 'unlike' : 'like';

    app.request({
      url: `/comments/${commentId}/${action}`,
      method: 'POST',
      success: (data) => {
        comment.liked = !comment.liked;
        this.setData({ comments });
      },
      fail: (err) => {
        console.error('操作失败:', err);
      }
    });
  },

  replyComment(e) {
    const commentId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  onCommentInput(e) {
    this.setData({
      commentText: e.detail.value
    });
  },

  submitComment() {
    const { momentId, commentText } = this.data;

    if (!commentText.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'error'
      });
      return;
    }

    this.setData({ submittingComment: true });

    app.request({
      url: `/moments/${momentId}/comments`,
      method: 'POST',
      data: {
        content: commentText
      },
      success: (data) => {
        this.setData({
          submittingComment: false,
          commentText: '',
          commentPage: 1,
          comments: []
        });

        wx.showToast({
          title: '评论成功',
          icon: 'success'
        });

        this.loadComments();
      },
      fail: (err) => {
        this.setData({ submittingComment: false });
        wx.showToast({
          title: '评论失败',
          icon: 'error'
        });
      }
    });
  },

  scrollToComments() {
    wx.pageScrollTo({
      selector: '.comments-section',
      duration: 300
    });
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = this.data.moment.media.map(m => m.url);

    wx.previewImage({
      urls,
      current: url
    });
  },

  shareMoment() {
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
            data: `https://petdimen.com/moments/${this.data.momentId}`,
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

  showMenu() {
    const moment = this.data.moment;
    const isOwner = moment.userId === app.globalData.userInfo?.id;

    const items = isOwner ? ['删除'] : ['举报'];

    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        if (isOwner && res.tapIndex === 0) {
          this.deleteMoment();
        } else if (!isOwner && res.tapIndex === 0) {
          this.reportMoment();
        }
      }
    });
  },

  deleteMoment() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条动态吗？',
      confirmText: '删除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });

          app.request({
            url: `/moments/${this.data.momentId}`,
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
        }
      }
    });
  },

  reportMoment() {
    wx.showModal({
      title: '举报动态',
      content: '确定要举报这条动态吗？',
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
