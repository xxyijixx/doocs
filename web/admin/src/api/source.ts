/**
 * 客服来源管理API
 */

import type {
  CustomerServiceSource,
  CreateSourceRequest,
  CreateSourceResponse,
} from '../types/source';
import { apiRequest } from './request';

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