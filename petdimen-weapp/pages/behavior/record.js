const app = getApp();

Page({
  data: {
    form: {
      petId: null,
      type: '',
      date: '',
      time: '',
      location: '',
      coordinates: '',
      remark: '',
      media: []
    },
    selectedPetIndex: -1,
    selectedPet: null,
    pets: [],
    petNames: [],
    behaviorTypes: [
      { code: 'feeding', name: '喂食', icon: '🍖' },
      { code: 'walking', name: '遛弯', icon: '🚶' },
      { code: 'playing', name: '玩耍', icon: '🎾' },
      { code: 'bathing', name: '洗澡', icon: '🛁' },
      { code: 'grooming', name: '美容', icon: '✂️' },
      { code: 'defecation', name: '排便', icon: '💩' },
      { code: 'urination', name: '排尿', icon: '💧' },
      { code: 'sleeping', name: '睡眠', icon: '😴' },
      { code: 'eating', name: '进食', icon: '🍽️' },
      { code: 'drinking', name: '喝水', icon: '💧' },
      { code: 'vomiting', name: '呕吐', icon: '🤢' },
      { code: 'other', name: '其他', icon: '📝' }
    ],
    today: '',
    submitting: false
  },

  onLoad() {
    // 设置今天的日期和时间
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    this.setData({
      today: `${year}-${month}-${day}`,
      'form.date': `${year}-${month}-${day}`,
      'form.time': `${hours}:${minutes}`
    });

    // 加载宠物列表
    this.loadPets();
  },

  loadPets() {
    app.request({
      url: '/pets?page=1&size=100',
      method: 'GET',
      success: (data) => {
        const pets = data.records || [];
        const petNames = pets.map(p => ({ id: p.id, name: p.name }));
        
        this.setData({
          pets,
          petNames
        });

        // 如果只有一只宠物，自动选中
        if (pets.length === 1) {
          this.selectPet(0);
        }
      },
      fail: (err) => {
        console.error('加载宠物列表失败:', err);
        wx.showToast({
          title: '加载宠物列表失败',
          icon: 'error'
        });
      }
    });
  },

  onPetChange(e) {
    const index = e.detail.value;
    this.selectPet(index);
  },

  selectPet(index) {
    const pet = this.data.pets[index];
    if (pet) {
      this.setData({
        selectedPetIndex: index,
        selectedPet: pet,
        'form.petId': pet.id
      });
    }
  },

  selectBehavior(e) {
    const code = e.currentTarget.dataset.code;
    this.setData({
      'form.type': code
    });
  },

  onDateChange(e) {
    const date = e.detail.value;
    this.setData({
      'form.date': date
    });
  },

  onTimeChange(e) {
    const time = e.detail.value;
    this.setData({
      'form.time': time
    });
  },

  selectLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'form.location': res.name || res.address,
          'form.coordinates': `${res.latitude.toFixed(6)}, ${res.longitude.toFixed(6)}`
        });
      },
      fail: (err) => {
        console.error('选择位置失败:', err);
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

  onSubmit(e) {
    const form = this.data.form;
    
    // 验证必填字段
    if (!form.petId) {
      wx.showToast({
        title: '请选择宠物',
        icon: 'error'
      });
      return;
    }
    
    if (!form.type) {
      wx.showToast({
        title: '请选择行为类型',
        icon: 'error'
      });
      return;
    }

    this.setData({ submitting: true });
    
    const data = {
      petId: form.petId,
      type: form.type,
      happenedAt: `${form.date} ${form.time}`,
      locationLat: form.coordinates ? parseFloat(form.coordinates.split(',')[0]) : null,
      locationLng: form.coordinates ? parseFloat(form.coordinates.split(',')[1]) : null,
      remark: form.remark,
      media: form.media.map(m => ({ url: m.url, type: m.type }))
    };

    app.request({
      url: '/behaviors',
      method: 'POST',
      data,
      success: (res) => {
        this.setData({ submitting: false });
        wx.showToast({
          title: '记录成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: (err) => {
        this.setData({ submitting: false });
        wx.showToast({
          title: '记录失败',
          icon: 'error'
        });
      }
    });
  },

  navigateBack() {
    wx.navigateBack();
  }
});
