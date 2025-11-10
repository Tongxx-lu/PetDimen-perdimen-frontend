<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSensitiveWords, addSensitiveWord, deleteSensitiveWord, type SensitiveWordVO } from '../api/admin'

const loading = ref(false)
const words = ref<SensitiveWordVO[]>([])
const categoryFilter = ref('')
const searchKey = ref('')
const dialogVisible = ref(false)
const newWord = ref({
  word: '',
  category: 'VULGAR',
  level: 1,
  action: 'REPLACE'
})

const categoryOptions = [
  { value: 'VULGAR', label: '粗俗词汇', icon: '🚫', color: '#FF4D4F' },
  { value: 'PORN', label: '色情内容', icon: '🔞', color: '#FF6B9D' },
  { value: 'VIOLENCE', label: '暴力内容', icon: '⚠️', color: '#FF7A45' },
  { value: 'POLITICAL', label: '政治敏感', icon: '🏛️', color: '#C77DFF' },
  { value: 'AD', label: '广告垃圾', icon: '📢', color: '#FBEA82' },
  { value: 'OTHER', label: '其他', icon: '📋', color: '#909399' },
]

const levelOptions = [
  { value: 1, label: '轻度', color: '#95DE64' },
  { value: 2, label: '中度', color: '#FBEA82' },
  { value: 3, label: '严重', color: '#FF4D4F' },
]

const actionOptions = [
  { value: 'REPLACE', label: '替换', icon: '✏️' },
  { value: 'BLOCK', label: '拦截', icon: '🚫' },
  { value: 'WARN', label: '警告', icon: '⚠️' },
]

const filteredWords = computed(() => {
  let result = words.value

  // 分类筛选
  if (categoryFilter.value) {
    result = result.filter(word => word.category === categoryFilter.value)
  }

  // 搜索筛选
  if (searchKey.value) {
    const key = searchKey.value.toLowerCase()
    result = result.filter(word => word.word?.toLowerCase().includes(key))
  }

  return result
})

const stats = computed(() => {
  const total = words.value.length
  const byCategory = categoryOptions.map(cat => ({
    ...cat,
    count: words.value.filter(w => w.category === cat.value).length
  }))
  const byLevel = levelOptions.map(lvl => ({
    ...lvl,
    count: words.value.filter(w => w.level === lvl.value).length
  }))
  return { total, byCategory, byLevel }
})

function getCategoryInfo(category: string) {
  return categoryOptions.find(c => c.value === category) || categoryOptions[5]
}

function getLevelInfo(level: number) {
  return levelOptions.find(l => l.value === level) || levelOptions[0]
}

function getActionInfo(action: string) {
  return actionOptions.find(a => a.value === action) || actionOptions[0]
}

async function loadWords() {
  loading.value = true
  try {
    words.value = await getSensitiveWords(categoryFilter.value || undefined)
    ElMessage.success('加载成功')
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  newWord.value = {
    word: '',
    category: 'VULGAR',
    level: 1,
    action: 'REPLACE'
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!newWord.value.word?.trim()) {
    ElMessage.warning('请输入敏感词')
    return
  }
  loading.value = true
  try {
    await addSensitiveWord(newWord.value)
    ElMessage.success('添加成功')
    dialogVisible.value = false
    loadWords()
  } catch (error: any) {
    ElMessage.error(error.message || '添加失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number, word: string) {
  try {
    await ElMessageBox.confirm(
      `确认删除敏感词"${word}"？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deleteSensitiveWord(id)
    ElMessage.success('删除成功')
    loadWords()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

function handleReset() {
  categoryFilter.value = ''
  searchKey.value = ''
  loadWords()
}

onMounted(() => {
  loadWords()
})
</script>

<template>
  <div class="sensitive-words-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <span class="icon">🚫</span>
        敏感词管理
      </h2>
      <p class="page-desc">管理系统敏感词库，自动过滤不当内容</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8" :md="6">
        <el-card shadow="hover" class="stat-card total-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF4D4F 0%, #FF6B9D 100%)">
              📊
            </div>
            <div class="stat-info">
              <div class="stat-label">敏感词总数</div>
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
              @click="categoryFilter = cat.value"
              :class="{ active: categoryFilter === cat.value }"
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

    <!-- 等级统计 -->
    <el-row :gutter="20" class="level-stats-row">
      <el-col :xs="24" :sm="8" v-for="lvl in stats.byLevel" :key="lvl.value">
        <el-card shadow="hover" class="level-card">
          <div class="level-content">
            <div class="level-label" :style="{ color: lvl.color }">{{ lvl.label }}</div>
            <div class="level-value" :style="{ color: lvl.color }">{{ lvl.count }}</div>
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
            placeholder="搜索敏感词..."
            prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-select
            v-model="categoryFilter"
            placeholder="选择分类"
            clearable
            class="category-select"
            @change="loadWords"
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
          <el-button type="danger" @click="handleAdd" class="add-btn">
            ➕ 添加敏感词
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 敏感词表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">📋 敏感词列表</span>
          <el-tag type="danger" size="small">
            共 {{ filteredWords.length }} 个
          </el-tag>
        </div>
      </template>

      <el-table
        :data="filteredWords"
        v-loading="loading"
        stripe
        style="width: 100%"
        :header-cell-style="{
          background: 'linear-gradient(135deg, #FF4D4F 0%, #FF6B9D 100%)',
          color: '#fff',
          fontWeight: '600'
        }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" size="small">#{{ row.id }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="word" label="敏感词" width="200">
          <template #default="{ row }">
            <div class="word-cell">
              <el-tag type="danger" effect="dark">
                {{ row.word }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="150" align="center">
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

        <el-table-column prop="level" label="等级" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :color="getLevelInfo(row.level).color"
              effect="light"
              style="border: none; color: #fff; font-weight: 500"
            >
              {{ getLevelInfo(row.level).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="action" label="处理方式" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">
              {{ getActionInfo(row.action).icon }} {{ getActionInfo(row.action).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            <div class="time-cell">
              <span class="time-icon">🕐</span>
              <span>{{ row.createdAt || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row.id, row.word)"
              :disabled="loading"
            >
              🗑️ 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && filteredWords.length === 0"
        description="暂无敏感词"
        :image-size="120"
      />
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加敏感词"
      width="600px"
      :close-on-click-modal="false"
      class="word-dialog"
    >
      <el-form :model="newWord" label-width="100px">
        <el-form-item label="敏感词" required>
          <el-input
            v-model="newWord.word"
            placeholder="请输入敏感词"
            maxlength="50"
            show-word-limit
          >
            <template #prefix>
              <span>🚫</span>
            </template>
          </el-input>
          <span class="form-tip">输入需要过滤的词汇或短语</span>
        </el-form-item>

        <el-form-item label="分类" required>
          <el-select v-model="newWord.category" placeholder="选择分类" style="width: 100%">
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

        <el-form-item label="敏感等级" required>
          <el-radio-group v-model="newWord.level" class="level-radio">
            <el-radio
              v-for="lvl in levelOptions"
              :key="lvl.value"
              :value="lvl.value"
              :style="{ '--radio-color': lvl.color }"
            >
              {{ lvl.label }}
            </el-radio>
          </el-radio-group>
          <span class="form-tip">等级越高，处理越严格</span>
        </el-form-item>

        <el-form-item label="处理方式" required>
          <el-radio-group v-model="newWord.action">
            <el-radio
              v-for="act in actionOptions"
              :key="act.value"
              :value="act.value"
            >
              {{ act.icon }} {{ act.label }}
            </el-radio>
          </el-radio-group>
          <span class="form-tip">
            替换：用***替换 | 拦截：禁止发布 | 警告：仅提示
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          @click="handleSave"
          :loading="loading"
          class="save-btn"
        >
          ➕ 添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.sensitive-words-page {
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

.stats-row,
.level-stats-row {
  margin-bottom: 20px;
}

.stat-card,
.category-stats-card,
.level-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 77, 79, 0.2);
  transition: all 0.3s;
  height: 100%;
}

.stat-card:hover,
.category-stats-card:hover,
.level-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(255, 77, 79, 0.15);
}

.stat-card :deep(.el-card__body),
.category-stats-card :deep(.el-card__body),
.level-card :deep(.el-card__body) {
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
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-around;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(255, 77, 79, 0.05);
  border-radius: 10px;
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
}

.category-item:hover {
  background: rgba(255, 77, 79, 0.1);
  transform: translateY(-2px);
}

.category-item.active {
  border-color: #FF4D4F;
  background: rgba(255, 77, 79, 0.15);
}

.cat-icon {
  font-size: 20px;
}

.cat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-label {
  font-size: 12px;
  color: #606266;
}

.cat-count {
  font-size: 18px;
  font-weight: 600;
}

.level-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-label {
  font-size: 15px;
  font-weight: 500;
}

.level-value {
  font-size: 24px;
  font-weight: 600;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 77, 79, 0.2);
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
  box-shadow: 0 0 0 1px rgba(255, 77, 79, 0.3) inset;
  transition: all 0.3s;
}

.search-input :deep(.el-input__wrapper:hover),
.category-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(255, 77, 79, 0.6) inset;
}

.search-input :deep(.el-input__wrapper.is-focus),
.category-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #FF4D4F inset !important;
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
  background: linear-gradient(135deg, #FF4D4F 0%, #FF6B9D 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

.table-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 77, 79, 0.2);
  overflow: hidden;
}

.table-card :deep(.el-card__header) {
  background: rgba(255, 77, 79, 0.05);
  border-bottom: 1px solid rgba(255, 77, 79, 0.1);
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
  background-color: rgba(255, 77, 79, 0.05) !important;
}

.table-card :deep(.el-table__body tr.el-table__row--striped) {
  background-color: rgba(255, 77, 79, 0.02);
}

.word-cell {
  display: flex;
  align-items: center;
  gap: 6px;
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

.word-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #FF4D4F 0%, #FF6B9D 100%);
  color: #fff;
  padding: 20px;
  margin: 0;
}

.word-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-weight: 600;
}

.word-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.word-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  display: block;
}

.level-radio {
  display: flex;
  gap: 20px;
}

.level-radio :deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: var(--radio-color);
  background-color: var(--radio-color);
}

.level-radio :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: var(--radio-color);
}

.save-btn {
  background: linear-gradient(135deg, #FF4D4F 0%, #FF6B9D 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

.el-button--danger {
  background: linear-gradient(135deg, #FF4D4F 0%, #FF6B9D 100%);
  border: none;
  color: #fff;
}

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
