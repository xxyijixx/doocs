/**
 * 客服来源管理API
 */

import type {
  CustomerServiceSource,
  CreateSourceRequest,
  CreateSourceResponse,
} from '../types/source';

// 配置API基础URL
const CONFIG_API_BASE_URL = 'http://192.168.31.214:8888/api/v1';

/**
 * 配置API响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * 通用API请求方法
 */
async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${CONFIG_API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * 创建客服来源
 * @param data 创建来源请求参数
 * @returns 创建结果
 */
export async function createSource(
  data: CreateSourceRequest
): Promise<CreateSourceResponse> {
  return apiRequest('/sources', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 获取所有客服来源列表
 * @returns 来源列表
 */
export async function getSourceList(): Promise<CustomerServiceSource[]> {
  return apiRequest('/sources');
}

/**
 * 根据ID获取客服来源详情
 * @param id 来源ID
 * @returns 来源详情
 */
export async function getSourceById(id: number): Promise<CustomerServiceSource> {
  return apiRequest(`/sources/${id}`);
}

/**
 * 更新客服来源配置
 * @param id 来源ID
 * @param data 更新数据
 * @returns 更新结果
 */
export async function updateSource(
  id: number,
  data: Partial<CustomerServiceSource>
): Promise<CustomerServiceSource> {
  return apiRequest(`/sources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除客服来源
 * @param id 来源ID
 * @returns 删除结果
 */
export async function deleteSource(id: number): Promise<void> {
  return apiRequest(`/sources/${id}`, {
    method: 'DELETE',
  });
}