/**
 * 配置相关API请求封装
 * 与DooTask交互的请求分离，专门处理系统配置相关的API调用
 */

import { apiRequest } from './request';
import type { ServerConfig } from '../types/config'

/**
 * 获取配置
 * @param configKey 配置键名
 * @returns 配置数据
 */
export async function getConfig(configKey: string): Promise<any> {
  return apiRequest(`/configs/${configKey}`);
}

/**
 * 保存配置
 * @param configKey 配置键名
 * @param configData 配置数据
 */
export async function saveConfig(configKey: string, configData: any): Promise<void> {
  return apiRequest(`/configs/${configKey}`, {
    method: 'POST',
    body: JSON.stringify(configData),
  });
}

/**
 * 获取所有配置
 * @returns 配置列表
 */
export async function getAllConfigs(): Promise<any[]> {
  return apiRequest('/configs');
}

/**
 * 删除配置
 * @param configKey 配置键名
 */
export async function deleteConfig(configKey: string): Promise<void> {
  return apiRequest(`/configs/${configKey}`, {
    method: 'DELETE',
  });
}

/**
 * 批量保存配置
 * @param configs 配置对象，键为configKey，值为配置数据
 */
export async function batchSaveConfigs(configs: Record<string, any>): Promise<void> {
  const promises = Object.entries(configs).map(([key, data]) => 
    saveConfig(key, data)
  );
  await Promise.all(promises);
}

/**
 * 检查配置是否存在
 * @param configKey 配置键名
 * @returns 是否存在
 */
export async function configExists(configKey: string): Promise<boolean> {
  try {
    await getConfig(configKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 关闭会话
 * @param conversationId 会话ID
 */
export async function closeConversation(conversationId: number): Promise<void> {
  return apiRequest(`/chat/agent/conversations/${conversationId}/close`, {
    method: 'PUT',
  });
}

/**
 * 重新打开会话
 * @param conversationId 会话ID
 */
export async function reopenConversation(conversationId: number): Promise<void> {
  return apiRequest(`/chat/agent/conversations/${conversationId}/reopen`, {
    method: 'PUT',
  });
}



export async function getServerConfig(): Promise<ServerConfig> {
  return apiRequest('/server/config', {
    method: 'GET'
  });
}