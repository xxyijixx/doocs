/**
 * API响应相关类型定义
 */

/**
 * 标准API响应格式
 */
export interface ApiResponse<T = any> {
  code: number;           // 业务状态码：200表示成功，-1表示业务错误
  message: string;        // 响应消息
  data?: T;              // 响应数据
  error?: string;        // 错误信息，仅在出错时返回
}

/**
 * 分页数据格式
 */
export interface PaginationData<T = any> {
  total: number;         // 总记录数
  page: number;          // 当前页码
  pageSize: number;      // 每页大小
  pages: number;         // 总页数
  items: T[];           // 数据列表
}

/**
 * API错误类型
 */
export class ApiError extends Error {
  public code: number;
  public originalError?: string;

  constructor(code: number, message: string, originalError?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * 网络错误类型
 */
export class NetworkError extends Error {
  public status?: number;
  public statusText?: string;

  constructor(message: string, status?: number, statusText?: string) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
    this.statusText = statusText;
  }
}