import { isMicroApp, getUserToken } from '@dootask/tools';

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * API配置
 */
interface ApiConfig {
  baseURL: string;
  timeout?: number;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const basePath = import.meta.env.VITE_BASE_PATH
/**
 * 默认API配置
 */
const DEFAULT_CONFIG: ApiConfig = {
//   baseURL: 'http://192.168.31.214:8888/api/v1',
  baseURL: `${apiBaseUrl || ''}${basePath || ''}/api/v1`,
  timeout: 10000,
};

/**
 * 通用API请求方法
 * @param url 请求URL
 * @param options 请求选项
 * @param config API配置
 * @returns 响应数据
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  config: Partial<ApiConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // 构建请求头
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...options.headers,
  });

  // 添加认证头
  headers.set('Authorization', 'Bearer 123456');
  if (isMicroApp()) {
    headers.set('Token', getUserToken());
  }

  const response = await fetch(`${finalConfig.baseURL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * GET请求
 * @param url 请求URL
 * @param config API配置
 * @returns 响应数据
 */
export async function get<T = any>(
  url: string,
  config?: Partial<ApiConfig>
): Promise<T> {
  return apiRequest<T>(url, { method: 'GET' }, config);
}

/**
 * POST请求
 * @param url 请求URL
 * @param data 请求数据
 * @param config API配置
 * @returns 响应数据
 */
export async function post<T = any>(
  url: string,
  data?: any,
  config?: Partial<ApiConfig>
): Promise<T> {
  return apiRequest<T>(
    url,
    {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    },
    config
  );
}

/**
 * PUT请求
 * @param url 请求URL
 * @param data 请求数据
 * @param config API配置
 * @returns 响应数据
 */
export async function put<T = any>(
  url: string,
  data?: any,
  config?: Partial<ApiConfig>
): Promise<T> {
  return apiRequest<T>(
    url,
    {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    },
    config
  );
}

/**
 * DELETE请求
 * @param url 请求URL
 * @param config API配置
 * @returns 响应数据
 */
export async function del<T = any>(
  url: string,
  config?: Partial<ApiConfig>
): Promise<T> {
  return apiRequest<T>(url, { method: 'DELETE' }, config);
}