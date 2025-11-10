<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, updateUserStatus, type UserManageVO } from '../api/admin'

const loading = ref(false)
const users = ref<UserManageVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const keyword = ref('')
const statusFilter = ref<number | undefined>(undefined)

async function loadUsers() {
  loading.value = true
  try {
    const result = await getUsers({
      page: page.value,
      size: size.value,
      keyword: keyword.value || undefined,
      status: statusFilter.value,
    })
    users.value = result.records
    total.value = result.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadUsers()
}

function handleReset() {
  keyword.value = ''
  statusFilter.value = undefined
  page.value = 1
  loadUsers()
}

function handlePageChange(val: number) {
  page.value = val
  loadUsers()
}

async function handleStatusChange(user: UserManageVO) {
  try {
    await updateUserStatus({
      userId: user.id,
      status: user.status,
      reason: user.status === 0 ? '管理员禁用' : '管理员启用',
    })
    ElMessage.success('状态更新成功')
  } catch (error: any) {
    ElMessage.error(error.message || '状态更新失败')
    loadUsers()
  }
}

function formatTime(time?: string) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="users-page">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <p class="page-desc">管理系统所有用户，查看用户信息、状态控制</p>
    </div>

    <!-- 搜索栏 -->
    <el-card shadow="hover" class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索关键词">
          <el-input
            v-model="keyword"
            placeholder="用户名/昵称/手机号"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="Search">搜索</el-button>
          <el-button @click="handleReset" icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card shadow="hover" class="table-card">
      <el-table :data="users" v-loading="loading" border stripe>
        <el-table-column prop="id" label="用户ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.roles?.includes('ADMIN')" type="danger" size="small">管理员</el-tag>
            <el-tag v-else type="success" size="small">普通用户</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              :disabled="row.roles?.includes('ADMIN')"
            />
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="180">
          <template #default="{ row }">
            {{ formatTime(row.lastLoginAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          :page-size="size"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.users-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.table-card {
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 表格样式优化 */
:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 12px 0;
}

:deep(.el-table--border) {
  border-radius: 4px;
}

/* 响应式 */
@media (max-width: 768px) {
  .users-page {
    padding: 12px;
  }

  .search-form {
    display: block;
  }

  .search-form :deep(.el-form-item) {
    display: block;
    margin-bottom: 12px;
  }

  .search-form :deep(.el-input),
  .search-form :deep(.el-select) {
    width: 100% !important;
  }
}
</style>
