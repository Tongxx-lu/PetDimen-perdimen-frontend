import { api, type ApiResult } from './client'

export type PageResp<T> = { records: T[]; total: number; current: number; size: number }

// Users
export type UserManageVO = {
  id: number
  username: string
  nickname?: string
  status: number // 0 disabled, 1 active
  createdTime?: string
}

export async function getUsers(params: {
  page?: number
  size?: number
  keyword?: string
  status?: number | undefined
}): Promise<PageResp<UserManageVO>> {
  const { data } = await api.get<ApiResult<PageResp<UserManageVO>>>('/api/admin/users', { params })
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function updateUserStatus(payload: { userId: number; status: number; reason?: string }) {
  const { data } = await api.put<ApiResult<void>>('/api/admin/users/status', payload)
  if (data.code !== 'OK') throw new Error(data.message)
}

// Bill Categories
export type BillCategory = { id: number; name: string; type: 'system' | 'custom' }

export async function listBillCategories(): Promise<BillCategory[]> {
  const { data } = await api.get<ApiResult<BillCategory[]>>('/api/admin/bill-categories')
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function createBillCategory(name: string): Promise<number> {
  const { data } = await api.post<ApiResult<number>>('/api/admin/bill-categories', undefined, {
    params: { name },
  })
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function updateBillCategory(id: number, name: string) {
  const { data } = await api.put<ApiResult<void>>(`/api/admin/bill-categories/${id}`, undefined, {
    params: { name },
  })
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function deleteBillCategory(id: number) {
  const { data } = await api.delete<ApiResult<void>>(`/api/admin/bill-categories/${id}`)
  if (data.code !== 'OK') throw new Error(data.message)
}

// Statistics
export type DashboardVO = {
  totalUsers: number
  todayNewUsers: number
  totalPets: number
  todayActivePets: number
  totalMoments: number
  pendingReviews: number
}

export type UserStatisticsVO = {
  dates: string[]
  newUserCounts: number[]
  activeUserCounts: number[]
  userGrowthTrend: Record<string, number>
  activeUsers: number
  roleDistribution: Record<string, number>
  regionDistribution: Record<string, number>
  genderDistribution: Record<string, number>
}

export async function getDashboard(): Promise<DashboardVO> {
  const { data } = await api.get<ApiResult<DashboardVO>>('/api/admin/dashboard')
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function getUserStatistics(period: 'week' | 'month' | 'year' = 'week'): Promise<UserStatisticsVO> {
  const { data } = await api.get<ApiResult<UserStatisticsVO>>('/api/admin/statistics/users', {
    params: { period },
  })
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

// Pet Tags
export type PetTag = {
  id: number
  code: string
  name: string
  category: string
  weight?: number
}

export async function listTags(): Promise<PetTag[]> {
  const { data } = await api.get<ApiResult<PetTag[]>>('/api/admin/tags')
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function createTag(tag: Omit<PetTag, 'id'>): Promise<void> {
  const { data } = await api.post<ApiResult<void>>('/api/admin/tags', tag)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function updateTag(tag: PetTag): Promise<void> {
  const { data } = await api.put<ApiResult<void>>('/api/admin/tags', tag)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function deleteTag(id: number): Promise<void> {
  const { data } = await api.delete<ApiResult<void>>(`/api/admin/tags/${id}`)
  if (data.code !== 'OK') throw new Error(data.message)
}

// Moderation
export type MomentAuditVO = {
  id: number
  userId: number
  userName: string
  content: string
  imageUrls?: string[]
  auditStatus: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export async function getMomentAuditList(params: {
  page: number
  size: number
  status?: string
}): Promise<PageResp<MomentAuditVO>> {
  const { data } = await api.get<ApiResult<PageResp<MomentAuditVO>>>('/api/admin/moments/audit', { params })
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function approveMoment(id: number): Promise<void> {
  const { data } = await api.post<ApiResult<void>>(`/api/admin/moments/${id}/approve`)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function rejectMoment(id: number, reason: string): Promise<void> {
  const { data } = await api.post<ApiResult<void>>(`/api/admin/moments/${id}/reject`, undefined, {
    params: { reason },
  })
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function deleteMoment(id: number): Promise<void> {
  const { data } = await api.delete<ApiResult<void>>(`/api/admin/moments/${id}`)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function auditMoment(payload: { id: number; action: 'APPROVE' | 'REJECT'; reason?: string }): Promise<void> {
  const { data } = await api.post<ApiResult<void>>('/api/admin/moments/audit', payload)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function batchAuditMoments(momentIds: number[], action: string, reason?: string): Promise<void> {
  const { data } = await api.post<ApiResult<void>>('/api/admin/moments/audit/batch', undefined, {
    params: { momentIds: momentIds.join(','), action, reason },
  })
  if (data.code !== 'OK') throw new Error(data.message)
}

// Shops Management
export type ShopManageVO = {
  id: number
  name: string
  category: string
  address: string
  phone?: string
  rating?: number
  status: number
  auditStatus?: string
  createdAt?: string
}

export async function getShops(params: {
  page: number
  size: number
  keyword?: string
  status?: number
}): Promise<PageResp<ShopManageVO>> {
  const { data } = await api.get<ApiResult<PageResp<ShopManageVO>>>('/api/admin/shops', { params })
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function createShop(shop: Omit<ShopManageVO, 'id'>): Promise<void> {
  const { data } = await api.post<ApiResult<void>>('/api/admin/shops', shop)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function updateShop(shop: ShopManageVO): Promise<void> {
  const { data } = await api.put<ApiResult<void>>('/api/admin/shops', shop)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function deleteShop(id: number): Promise<void> {
  const { data } = await api.delete<ApiResult<void>>(`/api/admin/shops/${id}`)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function updateShopStatus(id: number, status: number): Promise<void> {
  const { data } = await api.put<ApiResult<void>>(`/api/admin/shops/${id}/status`, undefined, {
    params: { status },
  })
  if (data.code !== 'OK') throw new Error(data.message)
}

// Comments Audit
export type CommentAuditVO = {
  id: number
  userId: number
  userName: string
  momentId: number
  content: string
  status: string
  createdAt: string
}

export async function getComments(params: {
  page: number
  size: number
  status?: string
}): Promise<PageResp<CommentAuditVO>> {
  const { data } = await api.get<ApiResult<PageResp<CommentAuditVO>>>('/api/admin/comments/audit', { params })
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function deleteComment(id: number): Promise<void> {
  const { data } = await api.delete<ApiResult<void>>(`/api/admin/comments/${id}`)
  if (data.code !== 'OK') throw new Error(data.message)
}

// Reports Management
export type ReportVO = {
  id: number
  reporterUserId: number
  reporterUserName: string
  targetType: string
  targetId: number
  reason: string
  status: string
  handleResult?: string
  createdAt: string
}

export async function getReports(params: {
  page: number
  size: number
  status?: string
  targetType?: string
}): Promise<PageResp<ReportVO>> {
  const { data } = await api.get<ApiResult<PageResp<ReportVO>>>('/api/admin/reports', { params })
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function handleReport(payload: {
  reportId: number
  action: string
  handleResult: string
}): Promise<void> {
  const { data } = await api.post<ApiResult<void>>('/api/admin/reports/handle', payload)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function batchHandleReports(reportIds: number[], action: string): Promise<void> {
  const { data } = await api.post<ApiResult<void>>('/api/admin/reports/handle/batch', undefined, {
    params: { reportIds: reportIds.join(','), action },
  })
  if (data.code !== 'OK') throw new Error(data.message)
}

// System Config
export type ConfigVO = {
  key: string
  value: string
  description?: string
}

export async function getConfigs(): Promise<ConfigVO[]> {
  const { data } = await api.get<ApiResult<ConfigVO[]>>('/api/admin/configs')
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function updateConfig(payload: { key: string; value: string }): Promise<void> {
  const { data } = await api.put<ApiResult<void>>('/api/admin/configs', payload)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function deleteConfig(key: string): Promise<void> {
  const { data } = await api.delete<ApiResult<void>>(`/api/admin/configs/${key}`)
  if (data.code !== 'OK') throw new Error(data.message)
}

// Sensitive Words
export type SensitiveWordVO = {
  id: number
  word: string
  category: string
  createdAt?: string
}

export async function getSensitiveWords(category?: string): Promise<SensitiveWordVO[]> {
  const { data } = await api.get<ApiResult<SensitiveWordVO[]>>('/api/admin/sensitive-words', {
    params: { category },
  })
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function addSensitiveWord(payload: { word: string; category: string }): Promise<void> {
  const { data } = await api.post<ApiResult<void>>('/api/admin/sensitive-words', payload)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function deleteSensitiveWord(id: number): Promise<void> {
  const { data } = await api.delete<ApiResult<void>>(`/api/admin/sensitive-words/${id}`)
  if (data.code !== 'OK') throw new Error(data.message)
}

// Announcements
export type AnnouncementVO = {
  id: number
  title: string
  content: string
  type: string
  priority: number
  status: number
  createdAt?: string
}

export async function getAnnouncements(params: {
  page: number
  size: number
}): Promise<PageResp<AnnouncementVO>> {
  const { data } = await api.get<ApiResult<PageResp<AnnouncementVO>>>('/api/admin/announcements', { params })
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}

export async function createAnnouncement(payload: {
  title: string
  content: string
  type: string
  priority?: number
}): Promise<void> {
  const { data } = await api.post<ApiResult<void>>('/api/admin/announcements', payload)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function updateAnnouncement(
  id: number,
  payload: { title: string; content: string; type: string; priority?: number }
): Promise<void> {
  const { data } = await api.put<ApiResult<void>>(`/api/admin/announcements/${id}`, payload)
  if (data.code !== 'OK') throw new Error(data.message)
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const { data } = await api.delete<ApiResult<void>>(`/api/admin/announcements/${id}`)
  if (data.code !== 'OK') throw new Error(data.message)
}

// Audit Logs
export type AdminAuditLog = {
  id: number
  adminId: number
  adminName: string
  action: string
  targetType?: string
  targetId?: number
  details?: string
  createdAt: string
}

export async function getAuditLogs(params: {
  page: number
  size: number
  adminId?: number
  action?: string
}): Promise<PageResp<AdminAuditLog>> {
  const { data } = await api.get<ApiResult<PageResp<AdminAuditLog>>>('/api/admin/audit-logs', { params })
  if (data.code !== 'OK') throw new Error(data.message)
  return data.data
}


