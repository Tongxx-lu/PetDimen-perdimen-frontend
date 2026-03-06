const app = getApp();

Page({
  data: {
    services: [],
    activeType: 'all',
    searchText: '',
    loading: true,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    searchTimeout: null,
    showMap: false,
    userLocation: null,
    mapMarkers: [],
    showNearbyCity: false,
    nearbyCityServices: [],
    currentCity: '当前位置',
    searchRadius: 5 // 默认搜索半径5公里
  },

  onLoad() {
    this.loadServices();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.setData({
      services: [],
      page: 1,
      hasMore: true
    });
    this.loadServices();
  },

  loadServices() {
    const { activeType, searchText, page, pageSize, searchRadius } = this.data;
    
    this.setData({ loading: page === 1 });

    // 获取用户位置
    wx.getLocation({
      type: 'gcj02',
      success: (location) => {
        // 保存用户位置
        this.setData({
          userLocation: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        });

        let url = `/nearby/shops?page=${page}&size=${pageSize}&lat=${location.latitude}&lng=${location.longitude}&radiusKm=${searchRadius}`;
        
        if (activeType !== 'all') {
          url += `&type=${activeType}`;
        }
        
        if (searchText.trim()) {
          url += `&keyword=${searchText}`;
        }

        this.makeRequest(url, page, location);
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        wx.showModal({
          title: '位置权限',
          content: '需要获取您的位置信息来显示附近服务，请授权',
          confirmText: '去授权',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
        
        // 使用默认位置（北京）
        const defaultLocation = { latitude: 39.9042, longitude: 116.4074 };
        this.setData({
          userLocation: defaultLocation,
          currentCity: '北京'
        });
        
        let url = `/nearby/shops?page=${page}&size=${pageSize}&lat=${defaultLocation.latitude}&lng=${defaultLocation.longitude}&radiusKm=${searchRadius}`;
        
        if (activeType !== 'all') {
          url += `&type=${activeType}`;
        }
        
        if (searchText.trim()) {
          url += `&keyword=${searchText}`;
        }

        this.makeRequest(url, page, defaultLocation);
      }
    });
  },

  makeRequest(url, page, location) {
    const { pageSize } = this.data;
    
    app.request({
      url,
      method: 'GET',
      success: (data) => {
        const newServices = (data.records || []).map(s => ({
          ...s,
          typeName: this.getServiceTypeName(s.type),
          distance: this.calculateDistance(
            location.latitude,
            location.longitude,
            s.latitude,
            s.longitude
          )
        }));

        const services = page === 1 ? newServices : [...this.data.services, ...newServices];

        this.setData({
          services,
          loading: false,
          loadingMore: false,
          hasMore: data.records && data.records.length === pageSize,
          showNearbyCity: false
        });

        // 如果本地没有搜索结果，推荐附近城市的服务
        if (page === 1 && services.length === 0) {
          this.loadNearbyCityServices(location);
        } else {
          // 更新地图标记
          this.updateMapMarkers(services);
        }
      },
      fail: (err) => {
        console.error('加载服务列表失败:', err);
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

  // 计算两点之间的距离（单位：公里）
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  },

  toRad(value) {
    return value * Math.PI / 180;
  },

  // 加载附近城市的服务
  loadNearbyCityServices(location) {
    const { activeType, searchText, pageSize } = this.data;
    
    // 扩大搜索半径到50公里
    let url = `/nearby/shops?page=1&size=${pageSize}&lat=${location.latitude}&lng=${location.longitude}&radiusKm=50`;
    
    if (activeType !== 'all') {
      url += `&type=${activeType}`;
    }
    
    if (searchText.trim()) {
      url += `&keyword=${searchText}`;
    }

    app.request({
      url,
      method: 'GET',
      success: (data) => {
        const nearbyCityServices = (data.records || []).map(s => ({
          ...s,
          typeName: this.getServiceTypeName(s.type),
          distance: this.calculateDistance(
            location.latitude,
            location.longitude,
            s.latitude,
            s.longitude
          )
        }));

        if (nearbyCityServices.length > 0) {
          this.setData({
            showNearbyCity: true,
            nearbyCityServices
          });
        }
      },
      fail: (err) => {
        console.error('加载附近城市服务失败:', err);
      }
    });
  },

  // 更新地图标记
  updateMapMarkers(services) {
    const { userLocation } = this.data;
    
    const markers = services.map((service, index) => ({
      id: service.id,
      latitude: service.latitude,
      longitude: service.longitude,
      iconPath: '/assets/icons/marker.png',
      width: 30,
      height: 30,
      title: service.name,
      callout: {
        content: service.name,
        color: '#333',
        fontSize: 12,
        borderRadius: 4,
        padding: 8,
        display: 'BYCLICK'
      }
    }));

    // 添加用户位置标记
    if (userLocation) {
      markers.unshift({
        id: 0,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        iconPath: '/assets/icons/user-location.png',
        width: 40,
        height: 40,
        title: '我的位置'
      });
    }

    this.setData({ mapMarkers: markers });
  },

  // 切换地图显示
  toggleMap() {
    this.setData({
      showMap: !this.data.showMap
    });
  },

  // 地图标记点击
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    if (markerId === 0) return; // 用户位置标记

    const service = this.data.services.find(s => s.id === markerId);
    if (service) {
      this.showServiceDetail(service);
    }
  },

  // 显示服务详情
  showServiceDetail(service) {
    wx.showModal({
      title: service.name,
      content: `类型: ${service.typeName}\n地址: ${service.address}\n电话: ${service.phone}\n距离: ${service.distance}km`,
      confirmText: '导航',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          this.navigateToService(service);
        }
      }
    });
  },

  // 导航到服务
  navigateToService(service) {
    wx.openLocation({
      latitude: service.latitude,
      longitude: service.longitude,
      name: service.name,
      address: service.address,
      scale: 18
    });
  },

  // 使用附近城市服务
  useNearbyCityService(e) {
    const index = e.currentTarget.dataset.index;
    const service = this.data.nearbyCityServices[index];
    
    this.setData({
      services: this.data.nearbyCityServices,
      showNearbyCity: false
    });

    this.updateMapMarkers(this.data.nearbyCityServices);
  },

  onSearchInput(e) {
    const searchText = e.detail.value;
    this.setData({ searchText });

    // 防抖搜索
    if (this.data.searchTimeout) {
      clearTimeout(this.data.searchTimeout);
    }

    const timeout = setTimeout(() => {
      this.setData({
        page: 1,
        services: [],
        hasMore: true,
        loading: true
      });
      this.loadServices();
    }, 500);

    this.setData({ searchTimeout: timeout });
  },

  filterServices(e) {
    const type = e.currentTarget.dataset.type;
    
    this.setData({
      activeType: type,
      services: [],
      page: 1,
      hasMore: true,
      loading: true
    });

    this.loadServices();
  },

  loadMore() {
    if (this.data.loadingMore || !this.data.hasMore) {
      return;
    }

    this.setData({
      page: this.data.page + 1,
      loadingMore: true
    });

    this.loadServices();
  },

  goDetail(e) {
    const serviceId = e.currentTarget.dataset.id;
    
    // 获取店铺详情
    app.request({
      url: `/nearby/shops/${serviceId}`,
      method: 'GET',
      success: (data) => {
        // 显示店铺详情
        wx.showModal({
          title: data.name,
          content: `地址: ${data.address}\n电话: ${data.phone}\n评分: ${data.score}`,
          showCancel: false
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      }
    });
  },

  callService(e) {
    const phone = e.currentTarget.dataset.phone;
    
    wx.makePhoneCall({
      phoneNumber: phone,
      success: () => {
        console.log('拨号成功');
      },
      fail: (err) => {
        console.error('拨号失败:', err);
        wx.showToast({
          title: '拨号失败',
          icon: 'error'
        });
      }
    });
  },

  openMap(e) {
    const latitude = parseFloat(e.currentTarget.dataset.lat);
    const longitude = parseFloat(e.currentTarget.dataset.lng);

    wx.openLocation({
      latitude,
      longitude,
      scale: 18,
      success: () => {
        console.log('打开地图成功');
      },
      fail: (err) => {
        console.error('打开地图失败:', err);
        wx.showToast({
          title: '打开地图失败',
          icon: 'error'
        });
      }
    });
  },

  shareService(e) {
    const serviceId = e.currentTarget.dataset.id;
    
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
            data: `https://petdimen.com/services/${serviceId}`,
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

  getServiceTypeName(type) {
    const typeMap = {
      'hospital': '医院',
      'grooming': '美容',
      'boarding': '寄养',
      'training': '训练',
      'supplies': '用品店',
      'cafe': '宠物咖啡',
      'other': '其他'
    };
    
    return typeMap[type] || type;
  },

  // 阻止事件冒泡
  stopPropagation(e) {
    // 阻止事件冒泡到父元素
  }
});
