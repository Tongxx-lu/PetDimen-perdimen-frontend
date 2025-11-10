<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listTags, createTag, updateTag, deleteTag, type PetTag } from '../api/admin'

const loading = ref(false)
const tags = ref<PetTag[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增标签')
const currentTag = ref<Partial<PetTag>>({})
const categoryFilter = ref('')
const searchKey = ref('')

const categoryOptions = [
  { value: 'CHARACTER', label: '性格', icon: '😊', color: '#7FCDD7' },
  { value: 'HABIT', label: '习惯', icon: '🎯', color: '#FF6B9D' },
  { value: 'HEALTH', label: '健康', icon: '💊', color: '#95DE64' },
  { value: 'SKILL', label: '技能', icon: '🎪', color: '#C77DFF' },
  { value: 'OTHER', label: '其他', icon: '📋', color: '#FBEA82' },
]

const filteredTags = computed(() => {
  let result = tags.value

  // 分类筛选
  if (categoryFilter.value) {
    result = result.filter(tag => tag.category === categoryFilter.value)
  }

  // 搜索筛选
  if (searchKey.value) {
    const key = searchKey.value.toLowerCase()
    result = result.filter(tag =>
      tag.code?.toLowerCase().includes(key) ||
      tag.name?.toLowerCase().includes(key) ||
      tag.description?.toLowerCase().includes(key)
    )
  }

  return result
})

const stats = computed(() => {
  const total = tags.value.length
  const byCategory = categoryOptions.map(cat => ({
    ...cat,
    count: tags.value.filter(t => t.category === cat.value).length
  }))
  return { total, byCategory }
})

function getCategoryInfo(category: string) {
  return categoryOptions.find(c => c.value === category) || categoryOptions[4]
}

async function loadTags() {
  loading.value = true
  try {
    tags.value = await listTags()
    ElMessage.success('加载成功')
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  dialogTitle.value = '新增标签'
  currentTag.value = { weight: 0, category: 'CHARACTER' }
  dialogVisible.value = true
}

function handleEdit(tag: PetTag) {
  dialogTitle.value = '编辑标签'
  currentTag.value = { ...tag }
  dialogVisible.value = true
}

async function handleSave() {
  if (!currentTag.value.code || !currentTag.value.name || !currentTag.value.category) {
    ElMessage.warning('请填写完整信息')
    return
  }
  loading.value = true
  try {
    if (currentTag.value.id) {
      await updateTag(currentTag.value as PetTag)
      ElMessage.success('更新成功')
    } else {
      await createTag(currentTag.value as Omit<PetTag, 'id'>)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadTags()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number, name: string) {
  try {
    await ElMessageBox.confirm(
      `确认删除标签"${name}"？该操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deleteTag(id)
    ElMessage.success('删除成功')
    loadTags()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

function handleReset() {
  categoryFilter.value = ''
  searchKey.value = ''
}

onMounted(() => {
  loadTags()
})
</script>

<template>
  <div class="pet-tags-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <span class="icon">🏷️</span>
        宠物标签管理
      </h2>
      <p class="page-desc">管理宠物的性格、习惯、健康等标签分类</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%)">
              📊
            </div>
            <div class="stat-info">
              <div class="stat-label">全部标签</div>
              <div class="stat-value">{{ stats.total }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="16" :md="18">
        <el-card shadow="hover" class="category-stats-card">
          <div class="category-stats">
            <div
              v-for="cat in stats.byCategory"
              :key="cat.value"
              class="category-item"
            >
              <span class="cat-icon">{{ cat.icon }}</span>
              <div class="cat-info">
                <span class="cat-label">{{ cat.label }}</span>
                <span class="cat-count" :style="{ color: cat.color }">{{ cat.count }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选卡片 -->
    <el-card shadow="hover" class="filter-card">
      <div class="filter-content">
        <div class="filter-left">
          <el-input
            v-model="searchKey"
            placeholder="搜索标签代码、名称或描述..."
            prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-select
            v-model="categoryFilter"
            placeholder="选择分类"
            clearable
            class="category-select"
          >
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            >
              <span class="option-content">
                <span class="option-icon">{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
              </span>
            </el-option>
          </el-select>
          <el-button @click="handleReset" class="reset-btn">
            🔄 重置
          </el-button>
        </div>
        <div class="filter-right">
          <el-button type="primary" @click="handleAdd" class="add-btn">
            ➕ 新增标签
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 标签表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">📋 标签列表</span>
          <el-tag type="info" size="small">
            共 {{ filteredTags.length }} 个标签
          </el-tag>
        </div>
      </template>

      <el-table
        :data="filteredTags"
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

        <el-table-column prop="code" label="标签代码" width="150">
          <template #default="{ row }">
            <el-tag
              type="primary"
              effect="light"
              style="font-family: 'Courier New', monospace; font-weight: 500"
            >
              {{ row.code }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="标签名称" width="150">
          <template #default="{ row }">
            <div class="tag-name">
              <span class="name-icon">🏷️</span>
              <span class="name-text">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :color="getCategoryInfo(row.category).color"
              effect="light"
              style="border: none; color: #fff; font-weight: 500"
            >
              {{ getCategoryInfo(row.category).icon }} {{ getCategoryInfo(row.category).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="weight" label="权重" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">{{ row.weight }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <span class="description-text">{{ row.description || '-' }}</span>
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
              @click="handleDelete(row.id, row.name)"
              :disabled="loading"
            >
              🗑️ 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && filteredTags.length === 0"
        description="暂无标签，请添加第一个标签"
        :image-size="120"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      class="tag-dialog"
    >
      <el-form :model="currentTag" label-width="90px">
        <el-form-item label="标签代码" required>
          <el-input
            v-model="currentTag.code"
            placeholder="例如: friendly"
            :disabled="!!currentTag.id"
            maxlength="50"
            show-word-limit
          >
            <template #prefix>
              <span>🔤</span>
            </template>
          </el-input>
          <span class="form-tip">代码创建后不可修改，请使用英文小写</span>
        </el-form-item>

        <el-form-item label="标签名称" required>
          <el-input
            v-model="currentTag.name"
            placeholder="例如: 友好的"
            maxlength="20"
            show-word-limit
          >
            <template #prefix>
              <span>🏷️</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="分类" required>
          <el-select v-model="currentTag.category" placeholder="选择分类" style="width: 100%">
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            >
              <span class="option-content">
                <span class="option-icon">{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="权重">
          <el-input-number
            v-model="currentTag.weight"
            :min="0"
            :max="100"
            placeholder="权重值（0-100）"
            style="width: 100%"
          />
          <span class="form-tip">权重越高，标签显示优先级越高</span>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="currentTag.description"
            type="textarea"
            :rows="3"
            placeholder="标签描述信息..."
            maxlength="200"
            show-word-limit
          />
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
          {{ currentTag.id ? '💾 保存' : '➕ 创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.pet-tags-page {
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

.stat-card,
.category-stats-card {
  border-radius: 12px;
  border: 1px solid rgba(127, 205, 215, 0.2);
  transition: all 0.3s;
  height: 100%;
}

.stat-card:hover,
.category-stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(127, 205, 215, 0.15);
}

.stat-card :deep(.el-card__body),
.category-stats-card :deep(.el-card__body) {
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

.category-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: space-around;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(127, 205, 215, 0.05);
  border-radius: 10px;
  transition: all 0.3s;
}

.category-item:hover {
  background: rgba(127, 205, 215, 0.1);
  transform: translateY(-2px);
}

.cat-icon {
  font-size: 24px;
}

.cat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-label {
  font-size: 13px;
  color: #606266;
}

.cat-count {
  font-size: 20px;
  font-weight: 600;
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

.search-input {
  width: 300px;
}

.category-select {
  width: 150px;
}

.search-input :deep(.el-input__wrapper),
.category-select :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(127, 205, 215, 0.3) inset;
  transition: all 0.3s;
}

.search-input :deep(.el-input__wrapper:hover),
.category-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(127, 205, 215, 0.6) inset;
}

.search-input :deep(.el-input__wrapper.is-focus),
.category-select :deep(.el-input__wrapper.is-focus) {
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

.reset-btn {
  background: #fff;
  border: 1px solid #dcdfe6;
}

.add-btn {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  border: none;
  font-weight: 600;
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

.tag-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.name-icon {
  font-size: 16px;
}

.name-text {
  font-weight: 500;
  color: #303133;
}

.description-text {
  color: #606266;
  font-size: 13px;
}

.tag-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  color: #fff;
  padding: 20px;
  margin: 0;
}

.tag-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-weight: 600;
}

.tag-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.tag-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  display: block;
}

.save-btn {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  border: none;
  font-weight: 600;
}

.el-button--primary {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  border: none;
}

.el-button--danger {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%);
  border: none;
}

.el-button--primary:hover,
.el-button--danger:hover {
  transform: translateY(-2px);
  opacity: 0.9;
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

  .search-input,
  .category-select {
    width: 100%;
  }

  .category-stats {
    flex-direction: column;
  }
}
</style>
