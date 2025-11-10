<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getAuditLogs, type AdminAuditLog } from '../api/admin'

const loading = ref(false)
const logs = ref<AdminAuditLog[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const actionFilter = ref('')
const adminFilter = ref('')
const dateRange = ref<[Date, Date] | null>(null)

const actionOptions = [
  { label: '用户管理', value: 'USER_MANAGE', icon: '👤', color: '#7FCDD7' },
  { label: '内容审核', value: 'CONTENT_AUDIT', icon: '📝', color: '#FF6B9D' },
  { label: '服务商管理', value: 'SHOP_MANAGE', icon: '🏪', color: '#C77DFF' },
  { label: '标签管理', value: 'TAG_MANAGE', icon: '🏷️', color: '#FBEA82' },
  { label: '举报处理', value: 'REPORT_HANDLE', icon: '🚨', color: '#FF4D4F' },
  { label: '系统配置', value: 'CONFIG_UPDATE', icon: '⚙️', color: '#95DE64' },
]

const stats = computed(() => {
  return {
    total: total.value,
    today: logs.value.filter(log => {
      const today = new Date().toDateString()
      return new Date(log.createdAt).toDateString() === today
    }).length
  }
})

async function loadLogs() {
  loading.value = true
  try {
    const result = await getAuditLogs({
      page: page.value,
      size: size.value,
      action: actionFilter.value || undefined,
    })
    logs.value = result.records
    total.value = result.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  page.value = 1
  loadLogs()
}

function handleReset() {
  actionFilter.value = ''
  adminFilter.value = ''
  dateRange.value = null
  page.value = 1
  loadLogs()
}

function handlePageChange(val: number) {
  page.value = val
  loadLogs()
}

function getActionTag(action: string) {
  const option = actionOptions.find(opt => opt.value === action)
  return option || { label: action, icon: '📋', color: '#909399' }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(() => {
  loadLogs()
})
</script>

<template>
  <div class="audit-logs-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <span class="icon">📜</span>
        审计日志
      </h2>
      <p class="page-desc">查看管理员操作记录，追踪系统变更历史</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%)">
              📊
            </div>
            <div class="stat-info">
              <div class="stat-label">总操作数</div>
              <div class="stat-value">{{ stats.total }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%)">
              📅
            </div>
            <div class="stat-info">
              <div class="stat-label">今日操作</div>
              <div class="stat-value">{{ stats.today }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <el-card shadow="hover" class="filter-card">
      <div class="filter-content">
        <div class="filter-group">
          <el-select
            v-model="actionFilter"
            placeholder="操作类型"
            clearable
            class="filter-select"
          >
            <el-option
              v-for="opt in actionOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            >
              <span class="option-content">
                <span class="option-icon">{{ opt.icon }}</span>
                <span>{{ opt.label }}</span>
              </span>
            </el-option>
          </el-select>

          <el-input
            v-model="adminFilter"
            placeholder="管理员名称"
            clearable
            class="filter-input"
            prefix-icon="User"
          />

          <div class="filter-actions">
            <el-button
              type="primary"
              @click="handleFilterChange"
              class="filter-btn"
            >
              🔍 筛选
            </el-button>
            <el-button @click="handleReset" class="reset-btn">
              🔄 重置
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 日志表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">📋 操作记录</span>
        </div>
      </template>

      <el-table
        :data="logs"
        v-loading="loading"
        stripe
        style="width: 100%"
        :header-cell-style="{
          background: 'linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%)',
          color: '#fff',
          fontWeight: '600'
        }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" size="small">#{{ row.id }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="adminName" label="管理员" width="140">
          <template #default="{ row }">
            <div class="admin-cell">
              <span class="admin-icon">👤</span>
              <span class="admin-name">{{ row.adminName || '未知' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="action" label="操作类型" width="180">
          <template #default="{ row }">
            <el-tag
              :color="getActionTag(row.action).color"
              effect="light"
              style="border: none; color: #fff; font-weight: 500"
            >
              <span class="action-tag-content">
                <span>{{ getActionTag(row.action).icon }}</span>
                <span>{{ getActionTag(row.action).label }}</span>
              </span>
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="目标" width="180">
          <template #default="{ row }">
            <div v-if="row.targetType" class="target-cell">
              <el-tag type="info" effect="plain" size="small">
                {{ row.targetType }}
              </el-tag>
              <span class="target-id">#{{ row.targetId }}</span>
            </div>
            <span v-else class="empty-text">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="details" label="详情" min-width="300">
          <template #default="{ row }">
            <div class="details-cell">
              {{ row.details || '-' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="{ row }">
            <div class="time-cell">
              <span class="time-icon">🕐</span>
              <span>{{ formatDate(row.createdAt) }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        :page-size="size"
        :total="total"
        layout="total, prev, pager, next, jumper"
        class="pagination"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<style scoped>
.audit-logs-page {
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

.page-title .icon {
  font-size: 28px;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid rgba(127, 205, 215, 0.2);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(127, 205, 215, 0.15);
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid rgba(127, 205, 215, 0.2);
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.filter-content {
  width: 100%;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select,
.filter-input {
  width: 200px;
}

.filter-select :deep(.el-input__wrapper),
.filter-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(127, 205, 215, 0.3) inset;
  transition: all 0.3s;
}

.filter-select :deep(.el-input__wrapper:hover),
.filter-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(127, 205, 215, 0.6) inset;
}

.filter-select :deep(.el-input__wrapper.is-focus),
.filter-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #7FCDD7 inset !important;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  font-size: 16px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.filter-btn {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  border: none;
  font-weight: 600;
}

.reset-btn {
  background: #fff;
  border: 1px solid #dcdfe6;
}

.table-card {
  border-radius: 12px;
  border: 1px solid rgba(127, 205, 215, 0.2);
  overflow: hidden;
}

.table-card :deep(.el-card__header) {
  background: rgba(127, 205, 215, 0.05);
  border-bottom: 1px solid rgba(127, 205, 215, 0.1);
  padding: 16px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.table-card :deep(.el-table) {
  border-radius: 0;
}

.table-card :deep(.el-table__row:hover) {
  background-color: rgba(127, 205, 215, 0.05) !important;
}

.table-card :deep(.el-table__body tr.el-table__row--striped) {
  background-color: rgba(127, 205, 215, 0.02);
}

.admin-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.admin-icon {
  font-size: 16px;
}

.admin-name {
  font-weight: 500;
  color: #303133;
}

.action-tag-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.target-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-id {
  font-family: 'Courier New', monospace;
  color: #606266;
  font-weight: 500;
}

.details-cell {
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

.time-icon {
  font-size: 14px;
}

.empty-text {
  color: #c0c4cc;
}

.pagination {
  margin-top: 20px;
  padding: 16px 0;
  display: flex;
  justify-content: center;
}

.pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  color: #fff;
}

.pagination :deep(.el-pager li:hover) {
  color: #7FCDD7;
}
</style>
