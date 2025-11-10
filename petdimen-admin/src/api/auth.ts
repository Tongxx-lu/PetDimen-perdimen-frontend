import { api, type ApiResult } from './client'

export type LoginRequest = { username: string; password: string }
export type AuthResponse = { token: string; userId: number; username: string; nickname: string }

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<ApiResult<AuthResponse>>('/api/auth/login', req)
  if (data.code !== 'OK') throw new Error(data.message || '登录失败')
  return data.data
}


