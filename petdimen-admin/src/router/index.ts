import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const Login = () => import('../pages/Login.vue')
const AdminLayout = () => import('../layouts/AdminLayout.vue')
const Dashboard = () => import('../pages/Dashboard.vue')
const Users = () => import('../pages/Users.vue')
const BillCategories = () => import('../pages/BillCategories.vue')
const Moderation = () => import('../pages/Moderation.vue')
const PetTags = () => import('../pages/PetTags.vue')
const Shops = () => import('../pages/Shops.vue')
const Comments = () => import('../pages/Comments.vue')
const Reports = () => import('../pages/Reports.vue')
const SystemConfig = () => import('../pages/SystemConfig.vue')
const SensitiveWords = () => import('../pages/SensitiveWords.vue')
const Announcements = () => import('../pages/Announcements.vue')
const AuditLogs = () => import('../pages/AuditLogs.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: Login },
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: Dashboard },
        { path: 'users', name: 'users', component: Users },
        { path: 'pet-tags', name: 'pet-tags', component: PetTags },
        { path: 'bill-categories', name: 'bill-categories', component: BillCategories },
        { path: 'moderation', name: 'moderation', component: Moderation },
        { path: 'shops', name: 'shops', component: Shops },
        { path: 'comments', name: 'comments', component: Comments },
        { path: 'reports', name: 'reports', component: Reports },
        { path: 'system-config', name: 'system-config', component: SystemConfig },
        { path: 'sensitive-words', name: 'sensitive-words', component: SensitiveWords },
        { path: 'announcements', name: 'announcements', component: Announcements },
        { path: 'audit-logs', name: 'audit-logs', component: AuditLogs },
      ],
    },
  ],
})

router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth) {
    if (!auth.token) return next({ name: 'login', query: { redirect: to.fullPath } })
    // Optional: restrict to admin only
    if (!auth.isAdmin) return next({ name: 'login' })
  }
  if (to.name === 'login' && auth.token && auth.isAdmin) {
    return next({ name: 'dashboard' })
  }
  next()
})

export default router


