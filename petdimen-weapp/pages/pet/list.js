const app = getApp();

Page({
  data: {
    pets: [],
    searchKeyword: '',
    filterType: 'all',
    filterTag: null,
    filterTagName: '',
    allTags: [],
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: false,
    loading: false,
    showTagFilter: false
  },

  onLoad() {
    this.loadTags();
    this.loadPets();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.setData({
      page: 1,
      pets: []
    });
    this.loadTags();
    this.loadPets();
  },

  // 加载所有标签
  loadTags() {
    app.request({
      url: '/pet-tags',
      method: 'GET',
      success: (data) => {
        const tags = data || [];
        this.setData({ allTags: tags });
      },
      fail: (err) => {
        console.error('加载标签失败:', err);
      }
    });
  },

  loadPets() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });

    const { page, pageSize, searchKeyword, filterType, filterTag } = this.data;
    
    let url = `/pets?page=${page}&size=${pageSize}`;
    
    if (searchKeyword) {
      url += `&keyword=${searchKeyword}`;
    }
    
    if (filterType !== 'all') {
      url += `&species=${filterType}`;
    }

    // 添加标签筛选
    if (filterTag) {
      url += `&tagId=${filterTag}`;
    }

    app.request({
      url,
      method: 'GET',
      success: (data) => {
        const records = data.records || [];
        const formattedPets = records.map(pet => ({
          ...pet,
          genderText: this.getGenderText(pet.gender),
          ageText: this.calculateAge(pet.birthDate),
          tags: pet.tags || []
        }));

        // 注意：不要在前端再次过滤，后端已经处理了所有筛选条件
        if (page === 1) {
          this.setData({ pets: formattedPets });
        } else {
          this.setData({
            pets: [...this.data.pets, ...formattedPets]
          });
        }

        this.setData({
          total: data.total || 0,
          hasMore: (page * pageSize) < (data.total || 0),
          loading: false
        });
      },
      fail: (err) => {
        console.error('加载宠物列表失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      }
    });
  },

  getGenderText(gender) {
    const genderMap = {
      0: '未知',
      1: '公',
      2: '母'
    };
    return genderMap[gender] || '未知';
  },

  calculateAge(birthDate) {
    if (!birthDate) return '未知';
    
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (months < 0) {
      return `${years - 1}岁`;
    }
    
    if (years === 0) {
      return `${months}个月`;
    }
    
    return `${years}岁${months}个月`;
  },

  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword,
      page: 1,
      pets: []
    });
    
    // 防抖搜索
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadPets();
    }, 500);
  },

  setFilter(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      filterType: type,
      page: 1,
      pets: []
    });
    this.loadPets();
  },

  // 切换标签筛选显示
  toggleTagFilter() {
    this.setData({
      showTagFilter: !this.data.showTagFilter
    });
  },

  // 设置标签筛选
  setTagFilter(e) {
    const tagId = e.currentTarget.dataset.tagId;
    const currentTag = this.data.filterTag;
    
    // 如果点击的是当前标签，则取消筛选
    const newTag = currentTag === tagId ? null : tagId;
    
    // 获取标签名称
    let tagName = '';
    if (newTag) {
      const selectedTag = this.data.allTags.find(t => t.id === newTag);
      tagName = selectedTag ? selectedTag.name : '';
    }
    
    this.setData({
      filterTag: newTag,
      filterTagName: tagName,
      page: 1,
      pets: [],
      showTagFilter: false
    });
    this.loadPets();
  },

  // 清除所有筛选
  clearFilters() {
    this.setData({
      filterType: 'all',
      filterTag: null,
      filterTagName: '',
      searchKeyword: '',
      page: 1,
      pets: []
    });
    this.loadPets();
  },

  loadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({
      page: this.data.page + 1
    });
    this.loadPets();
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

  editPet(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/pet/add?id=${id}`
    });
  },

  deletePet(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '删除宠物',
      content: '确定要删除这只宠物吗？此操作不可撤销。',
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(id);
        }
      }
    });
  },

  performDelete(id) {
    wx.showLoading({ title: '删除中...' });
    
    app.request({
      url: `/pets/${id}`,
      method: 'DELETE',
      success: () => {
        wx.hideLoading();
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        // 刷新列表
        this.setData({
          page: 1,
          pets: []
        });
        this.loadPets();
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
});
