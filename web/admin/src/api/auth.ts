/**
 * 权限验证相关API请求封装
 */

import { apiRequest } from './request';

/**
 * 用户权限信息接口
 */
export interface UserPermission {
  is_admin: boolean;
  is_agent: boolean;
  user_id: number;
  agent_info?: {
    id: number;
    username: string;
    name: string;
    avatar: string;
    dootask_user_id: number;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

/**
 * 验证用户权限
 * @returns 用户权限信息
 */
export async function verifyUserPermission(): Promise<UserPermission> {
  return apiRequest<UserPermission>('/agents/verify');
}

/**
 * 获取所有客服列表
 * @returns 客服列表
 */
export async function getAgentList(): Promise<any[]> {
  return apiRequest('/agents');
}

/**
 * 设置客服人员
 * @param dootaskUserIds DooTask用户ID列表
 * @returns 设置结果
 */
export async function setAgents(dootaskUserIds: number[]): Promise<any[]> {
  return apiRequest('/agents', {
    method: 'PUT',
    body: JSON.stringify({ dootask_user_ids: dootaskUserIds }),
  });
}