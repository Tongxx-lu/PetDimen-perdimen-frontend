<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)

const form = ref({
  username: '',
  password: '',
})

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    await auth.login(form.value.username, form.value.password)
    ElMessage.success('登录成功')
    router.push({ name: 'dashboard' })
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-background">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">🐾</span>
          <h1 class="logo-text">PetDimen</h1>
        </div>
        <p class="subtitle">宠物管理后台</p>
      </div>

      <el-form @submit.prevent="handleLogin" class="login-form">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p class="tip">默认账号：admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #7FCDD7 0%, #5ab9c9 50%, #FBEA82 100%);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

/* 动态圆圈背景 */
.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 5s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 60%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.login-card {
  width: 440px;
  max-width: 90%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  padding: 48px 40px;
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 56px;
  animation: bounce 2s ease infinite;
  filter: drop-shadow(0 4px 8px rgba(127, 205, 215, 0.3));
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

.logo-text {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #7FCDD7 0%, #5ab9c9 50%, #FBEA82 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 15px;
  color: #7FCDD7;
  margin: 0;
  font-weight: 500;
}

.login-form {
  margin-bottom: 24px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(127, 205, 215, 0.1);
  transition: all 0.3s ease;
  padding: 12px 16px;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 16px rgba(127, 205, 215, 0.15);
  border-color: #7FCDD7;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(127, 205, 215, 0.1);
  border-color: #7FCDD7;
}

.login-form :deep(.el-button) {
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  height: 48px;
  font-size: 16px;
  background: linear-gradient(135deg, #7FCDD7 0%, #5ab9c9 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(127, 205, 215, 0.3);
}

.login-form :deep(.el-button:hover) {
  background: linear-gradient(135deg, #66b7c4 0%, #4aa3b3 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(127, 205, 215, 0.4);
}

.login-form :deep(.el-button:active) {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.tip {
  font-size: 13px;
  color: #909399;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tip::before {
  content: '💡';
}

/* 响应式 */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    border-radius: 16px;
  }

  .logo-text {
    font-size: 30px;
  }

  .logo-icon {
    font-size: 48px;
  }

  .bg-circle {
    display: none;
  }
}
</style>
