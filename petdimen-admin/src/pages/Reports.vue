<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReports, handleReport, batchHandleReports, type ReportVO } from '../api/admin'

const loading = ref(false)
const reports = ref<ReportVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const statusFilter = ref('')
const targetTypeFilter = ref('')
const selectedIds = ref<number[]>([])

const dialogVisible = ref(false)
const currentReport = ref<ReportVO | null>(null)
const handleResult = ref('')

const stats = computed(() => {
  const pending = reports.value.filter(r => r.status === 'pending').length
  const handled = reports.value.filter(r => r.status === 'handled').length
  const rejected = reports.value.filter(r => r.status === 'rejected').length
  return { total: total.value, pending, handled, rejected }
})

const reportTypeOptions = [
  { value: 'moment', label: '动态', icon: '📝', color: '#7FCDD7' },
  { value: 'comment', label: '评论', icon: '💬', color: '#95DE64' },
  { value: 'user', label: '用户', icon: '👤', color: '#FBEA82' },
]

function getTypeInfo(type: string) {
  return reportTypeOptions.find(t => t.value === type) || reportTypeOptions[0]
}

function getStatusTag(status: string) {
  const map: Record<string, { text: string, color: string }> = {
    'pending': { text: '待处理', color: '#FBEA82' },
    'handled': { text: '已处理', color: '#95DE64' },
    'rejected': { text: '已驳回', color: '#FF6B9D' }
  }
  return map[status] || map['pending']
}

async function loadReports() {
  loading.value = true
  try {
    const result = await getReports({
      page: page.value,
      size: size.value,
      status: statusFilter.value || undefined,
      targetType: targetTypeFilter.value || undefined,
    })
    reports.value = result.records
    total.value = result.total
    ElMessage.success('加载成功')
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  page.value = 1
  loadReports()
}

function handleReset() {
  statusFilter.value = ''
  targetTypeFilter.value = ''
  page.value = 1
  loadReports()
}

function handlePageChange(val: number) {
  page.value = val
  loadReports()
}

function handleSelectionChange(selection: ReportVO[]) {
  selectedIds.value = selection.map((item) => item.id)
}

function openHandleDialog(report: ReportVO) {
  currentReport.value = report
  handleResult.value = ''
  dialogVisible.value = true
}

async function submitHandle(action: string) {
  if (!currentReport.value) return
  if (!handleResult.value) {
    ElMessage.warning('请填写处理结果')
    return
  }
  loading.value = true
  try {
    await handleReport({
      reportId: currentReport.value.id,
      action,
      handleResult: handleResult.value,
    })
    ElMessage.success('处理成功')
    dialogVisible.value = false
    loadReports()
  } catch (error: any) {
    ElMessage.error(error.message || '处理失败')
  } finally {
    loading.value = false
  }
}

async function handleBatch(action: string) {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要处理的举报')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确认批量${action === 'APPROVE' ? '通过' : '驳回'}选中的 ${selectedIds.value.length} 个举报？`,
      '批量处理',
      {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )
    await batchHandleReports(selectedIds.value, action)
    ElMessage.success('批量处理成功')
    selectedIds.value = []
    loadReports()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量处理失败')
    }
  }
}

onMounted(() => {
  loadReports()
})
</script>

<template>
  <div class="reports-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <span class="icon">🚨</span>
        举报管理
      </h2>
      <p class="page-desc">处理用户举报，维护平台内容安全</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%)">
              🚨
            </div>
            <div class="stat-info">
              <div class="stat-label">全部举报</div>
              <div class="stat-value">{{ stats.total }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%)">
              ⏳
            </div>
            <div class="stat-info">
              <div class="stat-label">待处理</div>
              <div class="stat-value" style="color: #FBEA82">{{ stats.pending }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #95DE64 0%, #52c41a 100%)">
              ✔️
            </div>
            <div class="stat-info">
              <div class="stat-label">已处理</div>
              <div class="stat-value" style="color: #95DE64">{{ stats.handled }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #C77DFF 0%, #A855F7 100%)">
              ❌
            </div>
            <div class="stat-info">
              <div class="stat-label">已驳回</div>
              <div class="stat-value" style="color: #C77DFF">{{ stats.rejected }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选卡片 -->
    <el-card shadow="hover" class="filter-card">
      <div class="filter-content">
        <div class="filter-left">
          <el-select
            v-model="statusFilter"
            placeholder="选择状态"
            clearable
            class="filter-select"
          >
            <el-option label="⏳ 待处理" value="pending" />
            <el-option label="✔️ 已处理" value="handled" />
            <el-option label="❌ 已驳回" value="rejected" />
          </el-select>
          <el-select
            v-model="targetTypeFilter"
            placeholder="举报类型"
            clearable
            class="filter-select"
          >
            <el-option label="📝 动态" value="moment" />
            <el-option label="💬 评论" value="comment" />
            <el-option label="👤 用户" value="user" />
          </el-select>
          <el-button @click="handleFilterChange" class="search-btn">
            🔍 搜索
          </el-button>
          <el-button @click="handleReset" class="reset-btn">
            🔄 重置
          </el-button>
        </div>
        <div class="filter-right">
          <el-button
            type="success"
            @click="handleBatch('APPROVE')"
            :disabled="selectedIds.length === 0 || loading"
            class="batch-btn"
          >
            ✔️ 批量通过 ({{ selectedIds.length }})
          </el-button>
          <el-button
            type="warning"
            @click="handleBatch('REJECT')"
            :disabled="selectedIds.length === 0 || loading"
            class="batch-btn"
          >
            ❌ 批量驳回 ({{ selectedIds.length }})
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 举报表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">🚨 举报列表</span>
          <el-tag type="info" size="small">
            共 {{ reports.length }} 条
          </el-tag>
        </div>
      </template>

      <el-table
        :data="reports"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        style="width: 100%"
        :header-cell-style="{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%)',
          color: '#fff',
          fontWeight: '600'
        }"
      >
        <el-table-column type="selection" width="55" align="center" />

        <el-table-column prop="id" label="ID" width="80" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" size="small">#{{ row.id }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reporterUserName" label="举报人" width="140">
          <template #default="{ row }">
            <div class="user-cell">
              <span class="user-icon">👤</span>
              <span class="user-name">{{ row.reporterUserName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="举报对象" width="160">
          <template #default="{ row }">
            <el-tag
              :color="getTypeInfo(row.targetType).color"
              effect="light"
              style="border: none; color: #fff; font-weight: 500"
            >
              {{ getTypeInfo(row.targetType).icon }} {{ getTypeInfo(row.targetType).label }}
            </el-tag>
            <span class="target-id">#{{ row.targetId }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="举报理由" min-width="250">
          <template #default="{ row }">
            <div class="reason-cell">
              {{ row.reason }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :color="getStatusTag(row.status).color"
              effect="light"
              style="border: none; color: #fff; font-weight: 500"
            >
              {{ getStatusTag(row.status).text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="handleResult" label="处理结果" width="180">
          <template #default="{ row }">
            <span v-if="row.handleResult" class="result-text">{{ row.handleResult }}</span>
            <span v-else class="empty-text">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="举报时间" width="180">
          <template #default="{ row }">
            <div class="time-cell">
              <span class="time-icon">🕐</span>
              <span>{{ row.createdAt }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="openHandleDialog(row)"
              :disabled="row.status !== 'pending' || loading"
            >
              🔧 处理
            </el-button>
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

    <!-- 处理对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="处理举报"
      width="600px"
      :close-on-click-modal="false"
      class="report-dialog"
    >
      <div v-if="currentReport" class="dialog-content">
        <el-descriptions :column="1" border class="report-desc">
          <el-descriptions-item label="举报人">
            <div class="desc-user">
              <span class="user-icon">👤</span>
              <span>{{ currentReport.reporterUserName }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="举报对象">
            <el-tag
              :color="getTypeInfo(currentReport.targetType).color"
              effect="light"
              size="small"
              style="border: none; color: #fff"
            >
              {{ getTypeInfo(currentReport.targetType).icon }} 
              {{ getTypeInfo(currentReport.targetType).label }} #{{ currentReport.targetId }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="举报理由">
            <div class="desc-reason">{{ currentReport.reason }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <el-form style="margin-top: 24px" label-width="100px">
          <el-form-item label="处理结果" required>
            <el-input
              v-model="handleResult"
              type="textarea"
              :rows="5"
              placeholder="请详细说明处理结果和采取的措施..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="warning"
          @click="submitHandle('REJECT')"
          :loading="loading"
          class="reject-btn"
        >
          ❌ 驳回
        </el-button>
        <el-button
          type="success"
          @click="submitHandle('APPROVE')"
          :loading="loading"
          class="approve-btn"
        >
          ✔️ 通过
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.reports-page {
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
  border: 1px solid rgba(255, 107, 157, 0.2);
  transition: all 0.3s;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(255, 107, 157, 0.15);
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
  border: 1px solid rgba(255, 107, 157, 0.2);
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.filter-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-left {
  display: flex;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
}

.filter-select {
  width: 150px;
}

.filter-select :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(255, 107, 157, 0.3) inset;
  transition: all 0.3s;
}

.filter-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(255, 107, 157, 0.6) inset;
}

.filter-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #FF6B9D inset !important;
}

.search-btn {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

.reset-btn {
  background: #fff;
  border: 1px solid #dcdfe6;
}

.filter-right {
  display: flex;
  gap: 12px;
}

.batch-btn {
  font-weight: 600;
}

.el-button--success.batch-btn {
  background: linear-gradient(135deg, #95DE64 0%, #52c41a 100%);
  border: none;
  color: #fff;
}

.el-button--warning.batch-btn {
  background: linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%);
  border: none;
  color: #fff;
}

.table-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 107, 157, 0.2);
  overflow: hidden;
}

.table-card :deep(.el-card__header) {
  background: rgba(255, 107, 157, 0.05);
  border-bottom: 1px solid rgba(255, 107, 157, 0.1);
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
  background-color: rgba(255, 107, 157, 0.05) !important;
}

.table-card :deep(.el-table__body tr.el-table__row--striped) {
  background-color: rgba(255, 107, 157, 0.02);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-icon {
  font-size: 16px;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.target-id {
  margin-left: 6px;
  color: #909399;
  font-size: 13px;
}

.reason-cell {
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
}

.result-text {
  color: #606266;
  font-size: 13px;
}

.empty-text {
  color: #c0c4cc;
  font-size: 13px;
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

.el-button--primary {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%);
  border: none;
  color: #fff;
}

.el-button--primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.pagination {
  margin-top: 20px;
  padding: 16px 0;
  display: flex;
  justify-content: center;
}

.pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%);
  color: #fff;
}

.pagination :deep(.el-pager li:hover) {
  color: #FF6B9D;
}

.report-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%);
  color: #fff;
  padding: 20px;
  margin: 0;
}

.report-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-weight: 600;
}

.report-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.dialog-content {
  padding: 10px 0;
}

.report-desc :deep(.el-descriptions__label) {
  font-weight: 600;
  width: 100px;
}

.desc-user {
  display: flex;
  align-items: center;
  gap: 6px;
}

.desc-reason {
  color: #606266;
  line-height: 1.6;
}

.reject-btn {
  background: linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

.approve-btn {
  background: linear-gradient(135deg, #95DE64 0%, #52c41a 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left,
  .filter-right {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .filter-right {
    flex-direction: column;
  }

  .batch-btn {
    width: 100%;
  }
}
</style>
