<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getDashboard, getUserStatistics, type DashboardVO, type UserStatisticsVO } from '../api/admin'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const loading = ref(false)
const dashboard = ref<DashboardVO | null>(null)
const statistics = ref<UserStatisticsVO | null>(null)
const period = ref<'week' | 'month' | 'year'>('week')

// 统计卡片数据
const statCards = computed(() => [
  {
    title: '总用户数',
    value: dashboard.value?.totalUsers || 0,
    increase: dashboard.value?.todayNewUsers || 0,
    icon: '👥',
    color: '#7FCDD7',
    bgColor: 'linear-gradient(135deg, #7FCDD7 0%, #5ab9c9 100%)',
  },
  {
    title: '总宠物数',
    value: dashboard.value?.totalPets || 0,
    increase: dashboard.value?.todayActivePets || 0,
    icon: '🐾',
    color: '#FBEA82',
    bgColor: 'linear-gradient(135deg, #FBEA82 0%, #f5dd4f 100%)',
  },
  {
    title: '动态总数',
    value: dashboard.value?.totalMoments || 0,
    increase: 0,
    icon: '📝',
    color: '#52c41a',
    bgColor: 'linear-gradient(135deg, #52c41a 0%, #3fa714 100%)',
  },
  {
    title: '待审核',
    value: dashboard.value?.pendingReviews || 0,
    increase: 0,
    icon: '⏳',
    color: '#ff4d4f',
    bgColor: 'linear-gradient(135deg, #ff4d4f 0%, #e63c3e 100%)',
  },
])

async function loadDashboard() {
  loading.value = true
  try {
    dashboard.value = await getDashboard()
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function loadStatistics() {
  loading.value = true
  try {
    statistics.value = await getUserStatistics(period.value)
    renderCharts()
  } catch (error: any) {
    ElMessage.error(error.message || '加载统计数据失败')
  } finally {
    loading.value = false
  }
}

function onPeriodChange() {
  loadStatistics()
}

function renderCharts() {
  if (!statistics.value) return

  // 用户增长趋势图
  renderUserTrendChart()
  // 角色分布饼图
  renderRoleDistributionChart()
  // 性别分布饼图
  renderGenderDistributionChart()
}

function renderUserTrendChart() {
  const chartDom = document.getElementById('user-trend-chart')
  if (!chartDom) return
  
  const chart = echarts.init(chartDom)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#7FCDD7',
      borderWidth: 1,
      textStyle: {
        color: '#666',
      },
    },
    legend: {
      data: ['新增用户', '活跃用户'],
      top: 10,
      textStyle: {
        color: '#606266',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 50,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: statistics.value?.dates || [],
      axisLabel: {
        rotate: 45,
        color: '#909399',
      },
      axisLine: {
        lineStyle: {
          color: '#e4e7ed',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#909399',
      },
      splitLine: {
        lineStyle: {
          color: '#f0f2f5',
        },
      },
    },
    series: [
      {
        name: '新增用户',
        type: 'bar',
        data: statistics.value?.newUserCounts || [],
        barWidth: '40%',
        itemStyle: {
          color: '#7FCDD7',  // 纯青色
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: '#5ABBC7',  // 悬停时稍深
          },
        },
      },
      {
        name: '活跃用户',
        type: 'line',
        data: statistics.value?.activeUserCounts || [],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#FF6B9D',  // 粉色撞色
        },
        itemStyle: {
          color: '#FF6B9D',
          borderWidth: 2,
          borderColor: '#fff',
        },
        areaStyle: {
          color: 'rgba(255, 107, 157, 0.2)',  // 半透明粉色填充
        },
        emphasis: {
          itemStyle: {
            color: '#FF4D7D',
            borderWidth: 3,
          },
        },
      },
    ],
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

function renderRoleDistributionChart() {
  const chartDom = document.getElementById('role-chart')
  if (!chartDom) return
  
  const chart = echarts.init(chartDom)
  const roleData = statistics.value?.roleDistribution || {}
  
  // 撞色配色方案
  const colorMap: Record<string, string> = {
    'USER': '#7FCDD7',      // 青色 - 普通用户
    'ADMIN': '#FBEA82',     // 黄色 - 管理员
    'VISITOR': '#FF6B9D',   // 粉色 - 访客
    'VIP': '#C77DFF',       // 紫色 - VIP
  }
  
  // 转换数据格式
  const data = Object.entries(roleData).map(([name, value]) => ({
    name: name === 'USER' ? '普通用户' : name === 'ADMIN' ? '管理员' : name === 'VISITOR' ? '访客' : name === 'VIP' ? 'VIP用户' : name,
    value: value as number,
    itemStyle: {
      color: colorMap[name] || '#95DE64',  // 默认浅绿色
    },
  }))
  
  // 计算总数
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  const option: EChartsOption = {
    title: {
      text: total > 0 ? `总计: ${total}人` : '暂无数据',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 14,
        color: '#606266',
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percent = total > 0 ? ((params.value / total) * 100).toFixed(1) : 0
        return `${params.name}<br/>人数: ${params.value}<br/>占比: ${percent}%`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#7FCDD7',
      borderWidth: 1,
      textStyle: {
        color: '#666',
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      itemGap: 20,
      itemWidth: 20,
      itemHeight: 14,
      textStyle: {
        color: '#606266',
        fontSize: 14,
        lineHeight: 20,
      },
      formatter: (name: string) => {
        const item = data.find(d => d.name === name)
        const value = item?.value || 0
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0
        return `${name}    ${value}人  (${percent}%)`
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 4,
        },
        label: {
          show: false,  // 不显示饼图上的标签
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
          scale: true,
          scaleSize: 12,
        },
        labelLine: {
          show: false,  // 不显示指引线
        },
        data: data,
      },
    ],
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

function renderGenderDistributionChart() {
  const chartDom = document.getElementById('gender-chart')
  if (!chartDom) return
  
  const chart = echarts.init(chartDom)
  const genderData = statistics.value?.genderDistribution || {}
  
  // 撞色配色方案
  const colorMap: Record<string, string> = {
    '1': '#7FCDD7',      // 青色 - 男性
    '2': '#FF6B9D',      // 粉色 - 女性
    '0': '#C77DFF',      // 紫色 - 未知
  }
  
  // 转换数据格式，并计算总数
  const data = Object.entries(genderData).map(([key, value]) => ({
    name: key === '1' ? '男性' : key === '2' ? '女性' : '未知',
    value: value as number,
    itemStyle: {
      color: colorMap[key] || '#95DE64',  // 默认浅绿色
    },
  }))
  
  // 计算总数
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  const option: EChartsOption = {
    title: {
      text: total > 0 ? `总计: ${total}人` : '暂无数据',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 14,
        color: '#606266',
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percent = total > 0 ? ((params.value / total) * 100).toFixed(1) : 0
        return `${params.name}<br/>人数: ${params.value}<br/>占比: ${percent}%`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#7FCDD7',
      borderWidth: 1,
      textStyle: {
        color: '#666',
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      itemGap: 20,
      itemWidth: 20,
      itemHeight: 14,
      textStyle: {
        color: '#606266',
        fontSize: 14,
        lineHeight: 20,
      },
      formatter: (name: string) => {
        const item = data.find(d => d.name === name)
        const value = item?.value || 0
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0
        return `${name}    ${value}人  (${percent}%)`
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 4,
        },
        label: {
          show: false,  // 不显示饼图上的标签
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
          scale: true,
          scaleSize: 12,
        },
        labelLine: {
          show: false,  // 不显示指引线
        },
        data: data,
      },
    ],
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

onMounted(() => {
  loadDashboard()
  loadStatistics()
})
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">📊 数据概览</h2>
      <p class="page-desc">实时监控平台核心数据与用户增长趋势</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :xs="24" :sm="12" :lg="6" v-for="card in statCards" :key="card.title">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: card.bgColor }">{{ card.icon }}</div>
          <div class="stat-content">
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-value" :style="{ color: card.color }">{{ card.value.toLocaleString() }}</div>
            <div class="stat-increase" v-if="card.increase">
              <span class="increase-label">今日新增</span>
              <span class="increase-value">+{{ card.increase }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 用户增长趋势 -->
    <el-card shadow="hover" style="margin-bottom: 20px" class="chart-card">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div class="card-header-left">
            <span class="card-icon">📈</span>
            <span class="card-title">用户增长趋势</span>
          </div>
          <el-radio-group v-model="period" @change="onPeriodChange" size="small">
            <el-radio-button value="week">最近一周</el-radio-button>
            <el-radio-button value="month">最近一月</el-radio-button>
            <el-radio-button value="year">最近一年</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div id="user-trend-chart" style="height: 350px" v-loading="loading"></div>
    </el-card>

    <!-- 分布统计 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header-left">
              <span class="card-icon">👥</span>
              <span class="card-title">角色分布</span>
            </div>
          </template>
          <div id="role-chart" style="height: 320px" v-loading="loading"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header-left">
              <span class="card-icon">⚧️</span>
              <span class="card-title">性别分布</span>
            </div>
          </template>
          <div id="gender-chart" style="height: 320px" v-loading="loading"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
  background: #f8f9fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 26px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 统计卡片样式 */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(127, 205, 215, 0.08);
  transition: all 0.3s ease;
  margin-bottom: 20px;
  border: 1px solid rgba(127, 205, 215, 0.1);
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(127, 205, 215, 0.15);
  border-color: rgba(127, 205, 215, 0.3);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-increase {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.increase-label {
  color: #909399;
}

.increase-value {
  color: #52c41a;
  font-weight: 600;
  background: #f6ffed;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 卡片头部 */
.card-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 图表卡片 */
.chart-card {
  margin-bottom: 20px;
  animation: slideInUp 0.4s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }

  .page-title {
    font-size: 22px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }

  .stat-value {
    font-size: 28px;
  }

  #user-trend-chart,
  #role-chart,
  #gender-chart {
    height: 280px !important;
  }
}
</style>
