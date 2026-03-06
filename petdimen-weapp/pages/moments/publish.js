const app = getApp();

Page({
  data: {
    form: {
      content: '',
      media: [],
      selectedPets: [],
      location: '',
      privacy: 'public'
    },
    pets: [],
    submitting: false
  },

  onLoad() {
    this.loadPets();
  },

  loadPets() {
    app.request({
      url: '/pets?page=1&size=100',
      method: 'GET',
      success: (data) => {
        const pets = data.records || [];
        this.setData({ pets });
      },
      fail: (err) => {
        console.error('加载宠物列表失败:', err);
      }
    });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`form.${field}`]: value
    });
  },

  uploadMedia() {
    wx.chooseImage({
      count: 9 - this.data.form.media.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePaths = res.tempFilePaths;
        
        wx.showLoading({ title: '上传中...' });
        
        let uploadedCount = 0;
        const media = [...this.data.form.media];
        
        filePaths.forEach((filePath, index) => {
          app.uploadFile({
            filePath,
            name: 'file',
            url: '/upload/image',
            success: (data) => {
              media.push({
                url: data.url,
                type: 'image'
              });
              uploadedCount++;
              
              if (uploadedCount === filePaths.length) {
                wx.hideLoading();
                this.setData({
                  'form.media': media
                });
                wx.showToast({
                  title: '上传成功',
                  icon: 'success'
                });
              }
            },
            fail: (err) => {
              uploadedCount++;
              if (uploadedCount === filePaths.length) {
                wx.hideLoading();
                wx.showToast({
                  title: '部分上传失败',
                  icon: 'error'
                });
              }
            }
          });
        });
      }
    });
  },

  deleteMedia(e) {
    const index = e.currentTarget.dataset.index;
    const media = this.data.form.media;
    media.splice(index, 1);
    
    this.setData({
      'form.media': media
    });
  },

  togglePet(e) {
    const petId = e.currentTarget.dataset.id;
    const selectedPets = this.data.form.selectedPets;
    const index = selectedPets.indexOf(petId);
    
    if (index > -1) {
      selectedPets.splice(index, 1);
    } else {
      selectedPets.push(petId);
    }
    
    this.setData({
      'form.selectedPets': selectedPets
    });
  },

  selectLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'form.location': res.name || res.address
        });
      },
      fail: (err) => {
        console.error('选择位置失败:', err);
      }
    });
  },

  setPrivacy(e) {
    const privacy = e.currentTarget.dataset.privacy;
    this.setData({
      'form.privacy': privacy
    });
  },

  onSubmit() {
    const form = this.data.form;
    
    // 验证必填字段
    if (!form.content.trim()) {
      wx.showToast({
        title: '请输入动态内容',
        icon: 'error'
      });
      return;
    }

    this.setData({ submitting: true });
    
    const data = {
      content: form.content,
      media: form.media,
      petIds: form.selectedPets,
      location: form.location,
      privacy: form.privacy
    };

    app.request({
      url: '/social/moments',
      method: 'POST',
      data,
      success: (res) => {
        this.setData({ submitting: false });
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: (err) => {
        this.setData({ submitting: false });
        wx.showToast({
          title: '发布失败',
          icon: 'error'
        });
      }
    });
  },

  navigateBack() {
    wx.navigateBack();
  }
});
