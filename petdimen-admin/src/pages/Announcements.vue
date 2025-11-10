<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type AnnouncementVO,
} from '../api/admin'

const loading = ref(false)
const announcements = ref<AnnouncementVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

const dialogVisible = ref(false)
const dialogTitle = ref('新增公告')
const currentAnnouncement = ref<Partial<AnnouncementVO>>({})

const stats = computed(() => {
  const active = announcements.value.filter(a => a.status === 1).length
  const inactive = announcements.value.filter(a => a.status === 0).length
  const highPriority = announcements.value.filter(a => a.priority === 2).length
  return { total: total.value, active, inactive, highPriority }
})

const typeOptions = [
  { value: 'notice', label: '通知', icon: '📢', color: '#7FCDD7' },
  { value: 'event', label: '活动', icon: '🎉', color: '#95DE64' },
  { value: 'system', label: '系统', icon: '⚙️', color: '#FBEA82' },
  { value: 'warning', label: '警告', icon: '⚠️', color: '#FF6B9D' },
]

const priorityOptions = [
  { value: 0, label: '低', icon: '⬇️', color: '#909399' },
  { value: 1, label: '中', icon: '➡️', color: '#FBEA82' },
  { value: 2, label: '高', icon: '⬆️', color: '#FF6B9D' },
]

function getTypeInfo(type: string) {
  return typeOptions.find(t => t.value === type) || typeOptions[0]
}

function getPriorityInfo(priority: number) {
  return priorityOptions.find(p => p.value === priority) || priorityOptions[0]
}

async function loadAnnouncements() {
  loading.value = true
  try {
    const result = await getAnnouncements({
      page: page.value,
      size: size.value,
    })
    announcements.value = result.records
    total.value = result.total
    ElMessage.success('加载成功')
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(val: number) {
  page.value = val
  loadAnnouncements()
}

function handleAdd() {
  dialogTitle.value = '新增公告'
  currentAnnouncement.value = { type: 'notice', priority: 0, status: 1 }
  dialogVisible.value = true
}

function handleEdit(announcement: AnnouncementVO) {
  dialogTitle.value = '编辑公告'
  currentAnnouncement.value = { ...announcement }
  dialogVisible.value = true
}

async function handleSave() {
  if (!currentAnnouncement.value.title || !currentAnnouncement.value.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }
  loading.value = true
  try {
    if (currentAnnouncement.value.id) {
      await updateAnnouncement(currentAnnouncement.value.id, {
        title: currentAnnouncement.value.title,
        content: currentAnnouncement.value.content,
        type: currentAnnouncement.value.type!,
        priority: currentAnnouncement.value.priority,
      })
      ElMessage.success('更新成功')
    } else {
      await createAnnouncement({
        title: currentAnnouncement.value.title,
        content: currentAnnouncement.value.content,
        type: currentAnnouncement.value.type!,
        priority: currentAnnouncement.value.priority,
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadAnnouncements()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number, title: string) {
  try {
    await ElMessageBox.confirm(
      `确认删除公告"${title}"？删除后不可恢复！`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    await deleteAnnouncement(id)
    ElMessage.success('删除成功')
    loadAnnouncements()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<template>
  <div class="announcements-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <span class="icon">📢</span>
        公告管理
      </h2>
      <p class="page-desc">发布和管理系统公告通知</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%)">
              📢
            </div>
            <div class="stat-info">
              <div class="stat-label">全部公告</div>
              <div class="stat-value">{{ stats.total }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #95DE64 0%, #52c41a 100%)">
              ✅
            </div>
            <div class="stat-info">
              <div class="stat-label">已发布</div>
              <div class="stat-value" style="color: #95DE64">{{ stats.active }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%)">
              ⬆️
            </div>
            <div class="stat-info">
              <div class="stat-label">高优先级</div>
              <div class="stat-value" style="color: #FF6B9D">{{ stats.highPriority }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #C77DFF 0%, #A855F7 100%)">
              📝
            </div>
            <div class="stat-info">
              <div class="stat-label">草稿箱</div>
              <div class="stat-value" style="color: #C77DFF">{{ stats.inactive }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作卡片 -->
    <el-card shadow="hover" class="action-card">
      <div class="action-content">
        <div class="action-left">
          <span class="action-title">📋 公告列表</span>
          <el-tag type="info" size="small">共 {{ announcements.length }} 条</el-tag>
        </div>
        <el-button type="primary" @click="handleAdd" class="add-btn">
          ➕ 新增公告
        </el-button>
      </div>
    </el-card>

    <!-- 公告表格 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        :data="announcements"
        v-loading="loading"
        stripe
        style="width: 100%"
        :header-cell-style="{
          background: 'linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%)',
          color: '#fff',
          fontWeight: '600'
        }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" size="small">#{{ row.id }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="公告标题" width="280">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="title-icon">📢</span>
              <span class="title-text">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="content" label="公告内容" min-width="300">
          <template #default="{ row }">
            <div class="content-cell">
              {{ row.content }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :color="getTypeInfo(row.type).color"
              effect="light"
              style="border: none; color: #fff; font-weight: 500"
            >
              {{ getTypeInfo(row.type).icon }} {{ getTypeInfo(row.type).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="优先级" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              :color="getPriorityInfo(row.priority).color"
              effect="light"
              style="border: none; color: #fff; font-weight: 500"
            >
              {{ getPriorityInfo(row.priority).icon }} {{ getPriorityInfo(row.priority).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" color="#95DE64" effect="light" style="border: none; color: #fff">
              ✅ 启用
            </el-tag>
            <el-tag v-else color="#909399" effect="light" style="border: none; color: #fff">
              📝 禁用
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            <div class="time-cell">
              <span class="time-icon">🕐</span>
              <span>{{ row.createdAt }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
              :disabled="loading"
            >
              ✏️ 编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row.id, row.title)"
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
      class="announcement-dialog"
    >
      <el-form :model="currentAnnouncement" label-width="90px">
        <el-form-item label="公告标题" required>
          <el-input
            v-model="currentAnnouncement.title"
            placeholder="请输入公告标题"
            maxlength="100"
            show-word-limit
          >
            <template #prefix>
              <span>📢</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="公告内容" required>
          <el-input
            v-model="currentAnnouncement.content"
            type="textarea"
            :rows="8"
            placeholder="请输入公告内容..."
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="公告类型" required>
          <el-select v-model="currentAnnouncement.type" placeholder="请选择类型" style="width: 100%">
            <el-option
              v-for="type in typeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            >
              <span class="option-content">
                <span class="option-icon">{{ type.icon }}</span>
                <span>{{ type.label }}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-select v-model="currentAnnouncement.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option
              v-for="priority in priorityOptions"
              :key="priority.value"
              :label="priority.label"
              :value="priority.value"
            >
              <span class="option-content">
                <span class="option-icon">{{ priority.icon }}</span>
                <span>{{ priority.label }}</span>
              </span>
            </el-option>
          </el-select>
          <span class="form-tip">高优先级公告会优先展示给用户</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSave"
          :loading="loading"
          class="save-btn"
        >
          {{ currentAnnouncement.id ? '💾 保存' : '➕ 创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.announcements-page {
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
  border: 1px solid rgba(251, 234, 130, 0.2);
  transition: all 0.3s;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(251, 234, 130, 0.15);
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

.action-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid rgba(251, 234, 130, 0.2);
}

.action-card :deep(.el-card__body) {
  padding: 20px;
}

.action-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.add-btn {
  background: linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

.table-card {
  border-radius: 12px;
  border: 1px solid rgba(251, 234, 130, 0.2);
  overflow: hidden;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.table-card :deep(.el-table) {
  border-radius: 0;
}

.table-card :deep(.el-table__row:hover) {
  background-color: rgba(251, 234, 130, 0.05) !important;
}

.table-card :deep(.el-table__body tr.el-table__row--striped) {
  background-color: rgba(251, 234, 130, 0.02);
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.title-text {
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-cell {
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
  background: linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%);
  border: none;
  color: #fff;
}

.el-button--danger {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%);
  border: none;
  color: #fff;
}

.el-button--primary:hover:not(:disabled),
.el-button--danger:hover:not(:disabled) {
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
  background: linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%);
  color: #fff;
}

.pagination :deep(.el-pager li:hover) {
  color: #FBEA82;
}

.announcement-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%);
  color: #fff;
  padding: 20px;
  margin: 0;
}

.announcement-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-weight: 600;
}

.announcement-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.announcement-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  font-size: 16px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  display: block;
}

.save-btn {
  background: linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

@media (max-width: 768px) {
  .action-content {
    flex-direction: column;
    gap: 12px;
  }

  .action-left,
  .add-btn {
    width: 100%;
  }
}
</style>
