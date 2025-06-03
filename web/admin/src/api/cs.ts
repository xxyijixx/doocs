/**
 * 配置相关API请求封装
 * 与DooTask交互的请求分离，专门处理系统配置相关的API调用
 */

// 配置API基础URL
const CONFIG_API_BASE_URL = 'http://192.168.31.214:8888/api/v1';

/**
 * 配置API响应接口
 */
export interface ConfigApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * 通用配置API请求方法
 */
async function configRequest<T = any>(
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
 * 获取配置
 * @param configKey 配置键名
 * @returns 配置数据
 */
export async function getConfig(configKey: string): Promise<any> {
  return configRequest(`/config/${configKey}`, {
    method: 'GET',
  });
}

/**
 * 保存配置
 * @param configKey 配置键名
 * @param configData 配置数据
 */
export async function saveConfig(configKey: string, configData: any): Promise<void> {
  return configRequest(`/config/${configKey}`, {
    method: 'POST',
    body: JSON.stringify(configData),
  });
}

/**
 * 获取所有配置
 * @returns 配置列表
 */
export async function getAllConfigs(): Promise<any[]> {
  return configRequest('/config', {
    method: 'GET',
  });
}

/**
 * 删除配置
 * @param configKey 配置键名
 */
export async function deleteConfig(configKey: string): Promise<void> {
  return configRequest(`/config/${configKey}`, {
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