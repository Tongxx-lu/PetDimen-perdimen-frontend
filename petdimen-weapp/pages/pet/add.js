const app = getApp();

Page({
  data: {
    isEdit: false,
    petId: null,
    form: {
      name: '',
      species: '',
      speciesIndex: -1,
      breed: '',
      gender: 0,
      birthDate: '',
      avatarUrl: '',
      tags: [],
      remark: ''
    },
    speciesOptions: ['狗', '猫', '兔子', '仓鼠', '鹦鹉', '乌龟', '鱼', '其他'],
    availableTags: [],
    today: '',
    submitting: false
  },

  onLoad(options) {
    // 设置今天的日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.setData({
      today: `${year}-${month}-${day}`
    });

    // 加载可用标签
    this.loadTags();

    // 如果是编辑模式
    if (options.id) {
      this.setData({
        isEdit: true,
        petId: options.id
      });
      this.loadPetDetail(options.id);
    }
  },

  loadTags() {
    app.request({
      url: '/pet-tags',
      method: 'GET',
      success: (data) => {
        const tags = data || [];
        this.setData({ availableTags: tags });
      },
      fail: (err) => {
        console.error('加载标签失败:', err);
      }
    });
  },

  loadPetDetail(id) {
    wx.showLoading({ title: '加载中...' });
    
    app.request({
      url: `/pets/${id}`,
      method: 'GET',
      success: (data) => {
        wx.hideLoading();
        
        const speciesIndex = this.data.speciesOptions.indexOf(data.species);
        const form = {
          name: data.name,
          species: data.species,
          speciesIndex: speciesIndex >= 0 ? speciesIndex : -1,
          breed: data.breed || '',
          gender: data.gender || 0,
          birthDate: data.birthDate || '',
          avatarUrl: data.avatarUrl || '',
          tags: data.tags ? data.tags.map(t => t.id) : [],
          remark: data.remark || ''
        };
        
        this.setData({ form });
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
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

  onSpeciesChange(e) {
    const index = e.detail.value;
    const species = this.data.speciesOptions[index];
    
    this.setData({
      'form.speciesIndex': index,
      'form.species': species
    });
  },

  onGenderChange(e) {
    const value = parseInt(e.detail.value);
    this.setData({
      'form.gender': value
    });
  },

  onBirthDateChange(e) {
    const date = e.detail.value;
    this.setData({
      'form.birthDate': date
    });
  },

  toggleTag(e) {
    const tagId = e.currentTarget.dataset.id;
    const tags = this.data.form.tags;
    
    const index = tags.indexOf(tagId);
    if (index > -1) {
      tags.splice(index, 1);
    } else {
      tags.push(tagId);
    }
    
    this.setData({
      'form.tags': tags
    });
  },

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
          url: '/upload/image',
          success: (data) => {
            wx.hideLoading();
            this.setData({
              'form.avatarUrl': data.url
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
  },

  onSubmit(e) {
    const form = this.data.form;
    
    // 验证必填字段
    if (!form.name) {
      wx.showToast({
        title: '请输入宠物名称',
        icon: 'error'
      });
      return;
    }
    
    if (!form.species) {
      wx.showToast({
        title: '请选择物种',
        icon: 'error'
      });
      return;
    }

    this.setData({ submitting: true });
    
    const data = {
      name: form.name,
      species: form.species,
      breed: form.breed,
      gender: form.gender,
      birthDate: form.birthDate,
      avatarUrl: form.avatarUrl,
      tags: form.tags,
      remark: form.remark
    };

    const url = this.data.isEdit ? `/pets/${this.data.petId}` : '/pets';
    const method = this.data.isEdit ? 'PUT' : 'POST';

    app.request({
      url,
      method,
      data,
      success: (res) => {
        this.setData({ submitting: false });
        wx.showToast({
          title: this.data.isEdit ? '修改成功' : '添加成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: (err) => {
        this.setData({ submitting: false });
        wx.showToast({
          title: this.data.isEdit ? '修改失败' : '添加失败',
          icon: 'error'
        });
      }
    });
  },

  navigateBack() {
    wx.navigateBack();
  }
});
