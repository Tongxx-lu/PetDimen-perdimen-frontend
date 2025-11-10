<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getConfigs, updateConfig, deleteConfig, type ConfigVO } from '../api/admin'

const loading = ref(false)
const configs = ref<ConfigVO[]>([])
const dialogVisible = ref(false)
const currentConfig = ref<Partial<ConfigVO>>({})
const searchKey = ref('')

const filteredConfigs = computed(() => {
  if (!searchKey.value) return configs.value
  return configs.value.filter(c => 
    c.key?.toLowerCase().includes(searchKey.value.toLowerCase()) ||
    c.value?.toLowerCase().includes(searchKey.value.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchKey.value.toLowerCase())
  )
})

async function loadConfigs() {
  loading.value = true
  try {
    configs.value = await getConfigs()
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleEdit(config: ConfigVO) {
  currentConfig.value = { ...config }
  dialogVisible.value = true
}

async function handleSave() {
  if (!currentConfig.value.key || !currentConfig.value.value) {
    ElMessage.warning('请填写配置键和值')
    return
  }
  loading.value = true
  try {
    await updateConfig({
      key: currentConfig.value.key,
      value: currentConfig.value.value,
    })
    ElMessage.success('更新成功')
    dialogVisible.value = false
    loadConfigs()
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete(key: string) {
  try {
    await ElMessageBox.confirm('确认删除该配置项？', '提示', { type: 'warning' })
    await deleteConfig(key)
    ElMessage.success('删除成功')
    loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadConfigs()
})
</script>

<template>
  <div class="system-config-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <span class="icon">⚙️</span>
        系统配置
      </h2>
      <p class="page-desc">管理系统全局配置参数</p>
    </div>

    <!-- 搜索栏 -->
    <el-card shadow="hover" class="search-card">
      <el-input
        v-model="searchKey"
        placeholder="搜索配置键、值或说明..."
        prefix-icon="Search"
        clearable
        style="max-width: 400px"
      />
    </el-card>

    <!-- 配置表格 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        :data="filteredConfigs"
        v-loading="loading"
        stripe
        style="width: 100%"
        :header-cell-style="{ 
          background: 'linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%)',
          color: '#fff',
          fontWeight: '600'
        }"
      >
        <el-table-column prop="key" label="配置键" width="300">
          <template #default="{ row }">
            <el-tag effect="plain" style="font-family: 'Courier New', monospace">
              {{ row.key }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="配置值" min-width="300">
          <template #default="{ row }">
            <div class="config-value">{{ row.value }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="200">
          <template #default="{ row }">
            <span class="config-desc">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEdit(row)"
              class="action-btn"
            >
              <span class="btn-icon">✏️</span> 编辑
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row.key)"
              class="action-btn"
            >
              <span class="btn-icon">🗑️</span> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑配置"
      width="600px"
      :close-on-click-modal="false"
      class="config-dialog"
    >
      <el-form :model="currentConfig" label-width="80px">
        <el-form-item label="配置键" required>
          <el-input
            v-model="currentConfig.key"
            :disabled="true"
            style="font-family: 'Courier New', monospace"
          />
        </el-form-item>
        <el-form-item label="配置值" required>
          <el-input
            v-model="currentConfig.value"
            type="textarea"
            :rows="4"
            placeholder="请输入配置值"
          />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="currentConfig.description"
            type="textarea"
            :rows="2"
            placeholder="配置说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSave"
          :loading="loading"
          style="background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%); border: none"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.system-config-page {
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

.search-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid rgba(127, 205, 215, 0.2);
}

.search-card :deep(.el-card__body) {
  padding: 20px;
}

.search-card :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(127, 205, 215, 0.3) inset;
  transition: all 0.3s;
}

.search-card :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(127, 205, 215, 0.6) inset;
}

.search-card :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #7FCDD7 inset !important;
}

.table-card {
  border-radius: 12px;
  border: 1px solid rgba(127, 205, 215, 0.2);
  overflow: hidden;
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

.config-value {
  font-family: 'Courier New', monospace;
  color: #606266;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-desc {
  color: #909399;
  font-size: 13px;
}

.action-btn {
  font-weight: 500;
  transition: all 0.3s;
}

.action-btn .btn-icon {
  margin-right: 4px;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.config-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  color: #fff;
  padding: 20px;
  margin: 0;
}

.config-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-weight: 600;
}

.config-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.config-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.config-dialog :deep(.el-textarea__inner),
.config-dialog :deep(.el-input__inner) {
  border-radius: 8px;
}

.config-dialog :deep(.el-textarea__inner:focus),
.config-dialog :deep(.el-input__inner:focus) {
  border-color: #7FCDD7;
}
</style>
