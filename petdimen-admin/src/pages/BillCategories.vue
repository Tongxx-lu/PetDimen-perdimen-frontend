<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listBillCategories, createBillCategory, updateBillCategory, deleteBillCategory, type BillCategory } from '../api/admin'

const loading = ref(false)
const categories = ref<BillCategory[]>([])
const newName = ref('')
const editingId = ref<number | null>(null)

async function fetch() {
  loading.value = true
  try {
    categories.value = await listBillCategories()
    ElMessage.success('加载成功')
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function add() {
  if (!newName.value.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  
  loading.value = true
  try {
    await createBillCategory(newName.value.trim())
    newName.value = ''
    ElMessage.success('添加成功')
    await fetch()
  } catch (error: any) {
    ElMessage.error(error.message || '添加失败')
  } finally {
    loading.value = false
  }
}

async function save(row: BillCategory) {
  if (!row.name.trim()) {
    ElMessage.warning('分类名称不能为空')
    return
  }
  
  loading.value = true
  try {
    await updateBillCategory(row.id, row.name.trim())
    editingId.value = null
    ElMessage.success('保存成功')
    await fetch()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

async function remove(row: BillCategory) {
  try {
    await ElMessageBox.confirm(
      `确认删除分类"${row.name}"？该操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    loading.value = true
    await deleteBillCategory(row.id)
    ElMessage.success('删除成功')
    await fetch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

function startEdit(id: number) {
  editingId.value = id
}

function getTypeTag(type: string) {
  return type === 'system'
    ? { text: '系统', color: '#7FCDD7' }
    : { text: '自定义', color: '#FF6B9D' }
}

onMounted(fetch)
</script>

<template>
  <div class="bill-categories-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <span class="icon">💰</span>
        账单分类管理
      </h2>
      <p class="page-desc">管理系统账单分类，用户可在创建账单时选择</p>
    </div>

    <!-- 添加分类卡片 -->
    <el-card shadow="hover" class="add-card">
      <div class="add-form">
        <el-input
          v-model="newName"
          placeholder="输入新分类名称，例如：食品、医疗、玩具..."
          size="large"
          clearable
          @keyup.enter="add"
          :disabled="loading"
          class="name-input"
        >
          <template #prefix>
            <span class="input-icon">🏷️</span>
          </template>
        </el-input>
        <el-button
          type="primary"
          size="large"
          @click="add"
          :loading="loading"
          class="add-btn"
        >
          <span v-if="!loading">➕ 添加分类</span>
        </el-button>
      </div>
    </el-card>

    <!-- 分类列表 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">📋 分类列表</span>
          <el-tag type="info" size="small">
            共 {{ categories.length }} 个分类
          </el-tag>
        </div>
      </template>

      <el-table
        :data="categories"
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
            <el-tag effect="plain" size="small">{{ row.id }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="分类名称" min-width="200">
          <template #default="{ row }">
            <div v-if="editingId === row.id" class="edit-input">
              <el-input
                v-model="row.name"
                size="small"
                @keyup.enter="save(row)"
                autofocus
              />
            </div>
            <div v-else class="category-name">
              <span class="name-icon">🏷️</span>
              <span class="name-text">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :color="getTypeTag(row.type).color"
              effect="light"
              style="border: none; color: #fff; font-weight: 500"
            >
              {{ getTypeTag(row.type).text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建者" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.userId" class="user-id">用户 #{{ row.userId }}</span>
            <el-tag v-else type="info" size="small" effect="plain">系统</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <div v-if="editingId === row.id" class="action-buttons">
              <el-button
                type="success"
                size="small"
                @click="save(row)"
                :loading="loading"
              >
                <span v-if="!loading">💾 保存</span>
              </el-button>
              <el-button
                size="small"
                @click="editingId = null"
                :disabled="loading"
              >
                取消
              </el-button>
            </div>
            <div v-else class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="startEdit(row.id)"
                :disabled="loading"
              >
                ✏️ 编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="remove(row)"
                :disabled="loading"
              >
                🗑️ 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && categories.length === 0"
        description="暂无分类，请添加第一个分类"
        :image-size="120"
      />
    </el-card>
  </div>
</template>

<style scoped>
.bill-categories-page {
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

.add-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 2px dashed rgba(127, 205, 215, 0.3);
  background: linear-gradient(135deg, rgba(127, 205, 215, 0.05) 0%, rgba(255, 107, 157, 0.05) 100%);
  transition: all 0.3s;
}

.add-card:hover {
  border-color: rgba(127, 205, 215, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(127, 205, 215, 0.1);
}

.add-card :deep(.el-card__body) {
  padding: 24px;
}

.add-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.name-input {
  flex: 1;
}

.name-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(127, 205, 215, 0.3) inset;
  border-radius: 10px;
  transition: all 0.3s;
}

.name-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(127, 205, 215, 0.6) inset;
}

.name-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #7FCDD7 inset !important;
}

.input-icon {
  font-size: 18px;
  margin-right: 4px;
}

.add-btn {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  border: none;
  padding: 12px 32px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(127, 205, 215, 0.3);
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

.category-name {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.name-icon {
  font-size: 18px;
}

.name-text {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.edit-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #7FCDD7 inset !important;
}

.user-id {
  font-size: 13px;
  color: #909399;
  font-family: 'Courier New', monospace;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-buttons .el-button {
  font-weight: 500;
  transition: all 0.3s;
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
}

.action-buttons .el-button--primary {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  border: none;
}

.action-buttons .el-button--danger {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%);
  border: none;
}

.action-buttons .el-button--success {
  background: linear-gradient(135deg, #95DE64 0%, #52c41a 100%);
  border: none;
}
</style>
