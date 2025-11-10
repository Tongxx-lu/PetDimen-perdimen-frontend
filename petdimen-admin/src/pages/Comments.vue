<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getComments, deleteComment, type CommentAuditVO } from '../api/admin'

const loading = ref(false)
const comments = ref<CommentAuditVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const statusFilter = ref('')

const stats = computed(() => {
  const pending = comments.value.filter(c => c.status === 'pending').length
  const approved = comments.value.filter(c => c.status === 'approved').length
  const rejected = comments.value.filter(c => c.status === 'rejected').length
  return { total: total.value, pending, approved, rejected }
})

async function loadComments() {
  loading.value = true
  try {
    const result = await getComments({
      page: page.value,
      size: size.value,
      status: statusFilter.value || undefined,
    })
    comments.value = result.records
    total.value = result.total
    ElMessage.success('加载成功')
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleStatusChange() {
  page.value = 1
  loadComments()
}

function handlePageChange(val: number) {
  page.value = val
  loadComments()
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm(
      '确认删除该评论？删除后不可恢复！',
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    await deleteComment(id)
    ElMessage.success('删除成功')
    loadComments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

function getStatusTag(status: string) {
  const map: Record<string, { type: string, text: string, color: string }> = {
    'pending': { type: 'warning', text: '待审核', color: '#FBEA82' },
    'approved': { type: 'success', text: '已通过', color: '#95DE64' },
    'rejected': { type: 'danger', text: '已驳回', color: '#FF6B9D' }
  }
  return map[status] || map['pending']
}

onMounted(() => {
  loadComments()
})
</script>

<template>
  <div class="comments-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <span class="icon">💬</span>
        评论审核
      </h2>
      <p class="page-desc">审核和管理用户评论内容，维护社区氛围</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%)">
              📊
            </div>
            <div class="stat-info">
              <div class="stat-label">全部评论</div>
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
              <div class="stat-label">待审核</div>
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
              <div class="stat-label">已通过</div>
              <div class="stat-value" style="color: #95DE64">{{ stats.approved }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%)">
              ❌
            </div>
            <div class="stat-info">
              <div class="stat-label">已驳回</div>
              <div class="stat-value" style="color: #FF6B9D">{{ stats.rejected }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选卡片 -->
    <el-card shadow="hover" class="filter-card">
      <div class="filter-content">
        <el-radio-group v-model="statusFilter" @change="handleStatusChange" size="large" class="status-radio">
          <el-radio-button value="">📋 全部评论</el-radio-button>
          <el-radio-button value="pending">⏳ 待审核</el-radio-button>
          <el-radio-button value="approved">✔️ 已通过</el-radio-button>
          <el-radio-button value="rejected">❌ 已驳回</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <!-- 评论表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">💬 评论列表</span>
          <el-tag type="info" size="small">
            共 {{ comments.length }} 条
          </el-tag>
        </div>
      </template>

      <el-table
        :data="comments"
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

        <el-table-column prop="userName" label="评论用户" width="140">
          <template #default="{ row }">
            <div class="user-cell">
              <span class="user-icon">👤</span>
              <span class="user-name">{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="momentId" label="所属动态" width="110" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain" size="small">
              📝 #{{ row.momentId }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="content" label="评论内容" min-width="300">
          <template #default="{ row }">
            <div class="content-cell">
              {{ row.content }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="审核状态" width="120" align="center">
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

        <el-table-column prop="createdAt" label="评论时间" width="180">
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
              type="danger"
              size="small"
              @click="handleDelete(row.id)"
              :disabled="loading"
            >
              🗑️ 删除
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
  </div>
</template>

<style scoped>
.comments-page {
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
  height: 100%;
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
  text-align: center;
}

.filter-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-radio :deep(.el-radio-button__inner) {
  padding: 12px 24px;
  font-weight: 500;
  font-size: 14px;
}

.status-radio :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  border-color: #7FCDD7;
  color: #fff;
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

.content-cell {
  color: #606266;
  line-height: 1.6;
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

.el-button--danger {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%);
  border: none;
  color: #fff;
}

.el-button--danger:hover {
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
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  color: #fff;
}

.pagination :deep(.el-pager li:hover) {
  color: #7FCDD7;
}

@media (max-width: 768px) {
  .status-radio :deep(.el-radio-button__inner) {
    padding: 10px 16px;
    font-size: 12px;
  }
}
</style>
