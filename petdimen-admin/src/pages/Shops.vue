<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getShops, createShop, updateShop, deleteShop, updateShopStatus, type ShopManageVO } from '../api/admin'

const loading = ref(false)
const shops = ref<ShopManageVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const keyword = ref('')
const statusFilter = ref<number | undefined>(undefined)

const dialogVisible = ref(false)
const dialogTitle = ref('新增服务商')
const currentShop = ref<Partial<ShopManageVO>>({})

const categoryOptions = [
  { value: '宠物医院', icon: '🏥', color: '#FF6B9D' },
  { value: '宠物店', icon: '🏪', color: '#7FCDD7' },
  { value: '宠物美容', icon: '✂️', color: '#C77DFF' },
  { value: '宠物寄养', icon: '🏠', color: '#FBEA82' },
  { value: '宠物训练', icon: '🎓', color: '#95DE64' },
]

const stats = computed(() => {
  const active = shops.value.filter(s => s.status === 1).length
  const inactive = shops.value.filter(s => s.status === 0).length
  const highRated = shops.value.filter(s => s.rating && s.rating >= 4.5).length
  return { total: total.value, active, inactive, highRated }
})

function getCategoryIcon(category: string) {
  const cat = categoryOptions.find(c => c.value === category)
  return cat || { icon: '🏪', color: '#7FCDD7' }
}

async function loadShops() {
  loading.value = true
  try {
    const result = await getShops({
      page: page.value,
      size: size.value,
      keyword: keyword.value || undefined,
      status: statusFilter.value,
    })
    shops.value = result.records
    total.value = result.total
    ElMessage.success('加载成功')
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadShops()
}

function handleReset() {
  keyword.value = ''
  statusFilter.value = undefined
  page.value = 1
  loadShops()
}

function handlePageChange(val: number) {
  page.value = val
  loadShops()
}

function handleAdd() {
  dialogTitle.value = '新增服务商'
  currentShop.value = { status: 1, rating: 5.0, category: '宠物店' }
  dialogVisible.value = true
}

function handleEdit(shop: ShopManageVO) {
  dialogTitle.value = '编辑服务商'
  currentShop.value = { ...shop }
  dialogVisible.value = true
}

async function handleSave() {
  if (!currentShop.value.name || !currentShop.value.category || !currentShop.value.address) {
    ElMessage.warning('请填写必填字段')
    return
  }
  loading.value = true
  try {
    if (currentShop.value.id) {
      await updateShop(currentShop.value as ShopManageVO)
      ElMessage.success('更新成功')
    } else {
      await createShop(currentShop.value as Omit<ShopManageVO, 'id'>)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadShops()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number, name: string) {
  try {
    await ElMessageBox.confirm(
      `确认删除服务商"${name}"？删除后不可恢复！`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    await deleteShop(id)
    ElMessage.success('删除成功')
    loadShops()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

async function handleStatusChange(shop: ShopManageVO) {
  try {
    await updateShopStatus(shop.id, shop.status)
    ElMessage.success('状态更新成功')
  } catch (error: any) {
    ElMessage.error(error.message || '状态更新失败')
    loadShops()
  }
}

onMounted(() => {
  loadShops()
})
</script>

<template>
  <div class="shops-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <span class="icon">🏪</span>
        服务商管理
      </h2>
      <p class="page-desc">管理平台合作的宠物服务商店铺信息</p>
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
              <div class="stat-label">全部商家</div>
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
              <div class="stat-label">已启用</div>
              <div class="stat-value" style="color: #95DE64">{{ stats.active }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FBEA82 0%, #F4D03F 100%)">
              ⭐
            </div>
            <div class="stat-info">
              <div class="stat-label">高评分</div>
              <div class="stat-value" style="color: #FBEA82">{{ stats.highRated }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF6B9D 0%, #FF4D7D 100%)">
              ⏸️
            </div>
            <div class="stat-info">
              <div class="stat-label">已禁用</div>
              <div class="stat-value" style="color: #FF6B9D">{{ stats.inactive }}</div>
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
            v-model="keyword"
            placeholder="搜索服务商名称或地址..."
            prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
            class="search-input"
          />
          <el-select
            v-model="statusFilter"
            placeholder="选择状态"
            clearable
            class="status-select"
          >
            <el-option label="✅ 已启用" :value="1" />
            <el-option label="⏸️ 已禁用" :value="0" />
          </el-select>
          <el-button @click="handleSearch" class="search-btn">
            🔍 搜索
          </el-button>
          <el-button @click="handleReset" class="reset-btn">
            🔄 重置
          </el-button>
        </div>
        <div class="filter-right">
          <el-button type="success" @click="handleAdd" class="add-btn">
            ➕ 新增服务商
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 服务商表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">🏪 服务商列表</span>
          <el-tag type="info" size="small">
            共 {{ shops.length }} 个
          </el-tag>
        </div>
      </template>

      <el-table
        :data="shops"
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

        <el-table-column prop="name" label="服务商名称" width="200">
          <template #default="{ row }">
            <div class="shop-name">
              <span class="shop-icon">🏪</span>
              <span class="name-text">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="类别" width="140" align="center">
          <template #default="{ row }">
            <el-tag
              :color="getCategoryIcon(row.category).color"
              effect="light"
              style="border: none; color: #fff; font-weight: 500"
            >
              {{ getCategoryIcon(row.category).icon }} {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="address" label="地址" min-width="250">
          <template #default="{ row }">
            <div class="address-cell">
              <span class="address-icon">📍</span>
              <span class="address-text">{{ row.address }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="联系电话" width="140">
          <template #default="{ row }">
            <div class="phone-cell">
              <span class="phone-icon">📞</span>
              <span>{{ row.phone || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="rating" label="评分" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.rating" type="warning" effect="light">
              ⭐ {{ row.rating.toFixed(1) }}
            </el-tag>
            <span v-else class="empty-text">暂无评分</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              :disabled="loading"
              active-color="#95DE64"
              inactive-color="#c0c4cc"
            />
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
      width="600px"
      :close-on-click-modal="false"
      class="shop-dialog"
    >
      <el-form :model="currentShop" label-width="100px">
        <el-form-item label="服务商名称" required>
          <el-input
            v-model="currentShop.name"
            placeholder="请输入服务商名称"
            maxlength="50"
            show-word-limit
          >
            <template #prefix>
              <span>🏪</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="类别" required>
          <el-select v-model="currentShop.category" placeholder="选择类别" style="width: 100%">
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.value"
              :label="cat.value"
              :value="cat.value"
            >
              <span class="option-content">
                <span class="option-icon">{{ cat.icon }}</span>
                <span>{{ cat.value }}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="地址" required>
          <el-input
            v-model="currentShop.address"
            placeholder="请输入详细地址"
            maxlength="200"
            show-word-limit
          >
            <template #prefix>
              <span>📍</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input
            v-model="currentShop.phone"
            placeholder="联系电话"
            maxlength="20"
          >
            <template #prefix>
              <span>📞</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="评分">
          <el-input-number
            v-model="currentShop.rating"
            :min="0"
            :max="5"
            :step="0.1"
            :precision="1"
            style="width: 100%"
          />
          <span class="form-tip">评分范围：0-5分</span>
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="currentShop.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
            active-color="#95DE64"
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
          {{ currentShop.id ? '💾 保存' : '➕ 创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.shops-page {
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

.status-select {
  width: 150px;
}

.search-input :deep(.el-input__wrapper),
.status-select :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(127, 205, 215, 0.3) inset;
  transition: all 0.3s;
}

.search-input :deep(.el-input__wrapper:hover),
.status-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(127, 205, 215, 0.6) inset;
}

.search-input :deep(.el-input__wrapper.is-focus),
.status-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #7FCDD7 inset !important;
}

.search-btn {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

.reset-btn {
  background: #fff;
  border: 1px solid #dcdfe6;
}

.add-btn {
  background: linear-gradient(135deg, #95DE64 0%, #52c41a 100%);
  border: none;
  color: #fff;
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

.shop-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shop-icon {
  font-size: 18px;
}

.name-text {
  font-weight: 500;
  color: #303133;
}

.address-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
}

.address-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.address-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.phone-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-family: 'Courier New', monospace;
}

.phone-icon {
  font-size: 14px;
}

.empty-text {
  color: #c0c4cc;
  font-size: 13px;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  font-size: 16px;
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

.shop-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #7FCDD7 0%, #5ABBC7 100%);
  color: #fff;
  padding: 20px;
  margin: 0;
}

.shop-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-weight: 600;
}

.shop-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.shop-dialog :deep(.el-form-item__label) {
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
  .status-select {
    width: 100%;
  }
}
</style>
