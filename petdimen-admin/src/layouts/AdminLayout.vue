<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const active = ref(route.name as string)
watch(
  () => route.name,
  (n) => {
    active.value = String(n || '')
  }
)
const auth = useAuthStore()
const collapsed = ref(false)

function onLogout() {
  ElMessage.success('退出登录成功')
  auth.logout()
  router.push({ name: 'login' })
}

function toggleSidebar() {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <div class="admin-layout">
    <el-container style="height: 100vh">
      <!-- 侧边栏 -->
      <el-aside :width="collapsed ? '64px' : '220px'" class="sidebar">
        <div class="brand" v-if="!collapsed">
          <span class="brand-icon">🐾</span>
          <div class="brand-info">
            <span class="brand-text">PetDimen</span>
            <span class="brand-subtitle">管理后台</span>
          </div>
        </div>
        <div class="brand-collapsed" v-else>
          <span class="brand-icon">🐾</span>
        </div>

        <el-menu
          :default-active="active"
          :collapse="collapsed"
          router
          class="sidebar-menu"
          background-color="#001529"
          text-color="rgba(255, 255, 255, 0.65)"
          active-text-color="#7FCDD7"
        >
          <el-menu-item index="dashboard" :route="{ name: 'dashboard' }">
            <template #title>
              <span class="menu-icon">📊</span>
              <span>数据概览</span>
            </template>
          </el-menu-item>

          <el-sub-menu index="user-management">
            <template #title>
              <span class="menu-icon">👥</span>
              <span>用户管理</span>
            </template>
            <el-menu-item index="users" :route="{ name: 'users' }">用户列表</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="content-management">
            <template #title>
              <span class="menu-icon">📝</span>
              <span>内容管理</span>
            </template>
            <el-menu-item index="moderation" :route="{ name: 'moderation' }">动态审核</el-menu-item>
            <el-menu-item index="comments" :route="{ name: 'comments' }">评论审核</el-menu-item>
            <el-menu-item index="reports" :route="{ name: 'reports' }">举报管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="business-management">
            <template #title>
              <span class="menu-icon">🏪</span>
              <span>业务管理</span>
            </template>
            <el-menu-item index="shops" :route="{ name: 'shops' }">服务商管理</el-menu-item>
            <el-menu-item index="pet-tags" :route="{ name: 'pet-tags' }">宠物标签</el-menu-item>
            <el-menu-item index="bill-categories" :route="{ name: 'bill-categories' }">账单分类</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="operations">
            <template #title>
              <span class="menu-icon">📢</span>
              <span>运营管理</span>
            </template>
            <el-menu-item index="announcements" :route="{ name: 'announcements' }">公告管理</el-menu-item>
            <el-menu-item index="sensitive-words" :route="{ name: 'sensitive-words' }">敏感词管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="system">
            <template #title>
              <span class="menu-icon">⚙️</span>
              <span>系统管理</span>
            </template>
            <el-menu-item index="system-config" :route="{ name: 'system-config' }">系统配置</el-menu-item>
            <el-menu-item index="audit-logs" :route="{ name: 'audit-logs' }">审计日志</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-button text @click="toggleSidebar" class="collapse-btn">
              <span v-if="collapsed" style="font-size: 22px">☰</span>
              <span v-else style="font-size: 20px">✕</span>
            </el-button>
          </div>
          <div class="header-right">
            <div class="user-info">
              <span class="user-avatar">👤</span>
              <span class="user-name">{{ auth.profile?.nickname || '管理员' }}</span>
            </div>
            <el-button class="logout-btn" @click="onLogout" size="small">
              <span style="margin-right: 4px">🚪</span>
              退出登录
            </el-button>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  background: #001529;
  transition: width 0.3s ease;
  overflow-x: hidden;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
}

.brand {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 16px;
  background: linear-gradient(135deg, rgba(127, 205, 215, 0.1) 0%, rgba(251, 234, 130, 0.05) 100%);
  border-bottom: 1px solid rgba(127, 205, 215, 0.2);
}

.brand-collapsed {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(127, 205, 215, 0.1) 0%, rgba(251, 234, 130, 0.05) 100%);
  border-bottom: 1px solid rgba(127, 205, 215, 0.2);
}

.brand-icon {
  font-size: 36px;
  filter: drop-shadow(0 2px 4px rgba(127, 205, 215, 0.5));
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-text {
  font-size: 22px;
  font-weight: 700;
  color: #7FCDD7;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: -2px;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.menu-icon {
  font-size: 18px;
  margin-right: 10px;
}

.el-menu-item:hover {
  background: rgba(127, 205, 215, 0.08) !important;
}

.el-menu-item.is-active {
  background: linear-gradient(90deg, rgba(127, 205, 215, 0.15) 0%, transparent 100%) !important;
  color: #7FCDD7 !important;
  border-right: 3px solid #7FCDD7;
  font-weight: 600;
}

.el-sub-menu__title:hover {
  background: rgba(127, 205, 215, 0.08) !important;
}

/* 头部样式 */
.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 0 24px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  padding: 8px 12px;
  color: #606266;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  color: #7FCDD7;
  background: rgba(127, 205, 215, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #feffee 0%, #fffbe6 100%);
  border-radius: 20px;
  border: 1px solid rgba(127, 205, 215, 0.2);
}

.user-avatar {
  font-size: 20px;
}

.user-name {
  font-size: 14px;
  color: #606266;
  font-weight: 600;
}

.logout-btn {
  background: linear-gradient(135deg, #ff4d4f 0%, #e63c3e 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #e63c3e 0%, #cc3335 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

/* 主内容区 */
.main-content {
  background: #f8f9fa;
  padding: 0;
  overflow-y: auto;
}

/* 页面过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(127, 205, 215, 0.3);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(127, 205, 215, 0.5);
}

/* 响应式 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .user-name {
    display: none;
  }

  .brand-text {
    font-size: 18px;
  }
}
</style>
