/**
 * 错误处理工具函数
 */

import { ApiError, NetworkError } from "../types/api";

/**
 * 错误提示配置
 */
export interface ErrorToastConfig {
  showToast?: (message: string, type?: "error" | "warning" | "info") => void;
  showNetworkError?: (error: NetworkError) => void;
  showApiError?: (error: ApiError) => void;
}

/**
 * 默认错误消息映射
 */
const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  0: "操作失败，请稍后重试",
  401: "登录已过期，请重新登录",
  403: "权限不足，无法执行此操作",
  404: "请求的资源不存在",
  500: "服务器内部错误，请稍后重试",
};

/**
 * 网络错误消息映射
 */
const NETWORK_ERROR_MESSAGES: Record<number, string> = {
  400: "请求参数错误",
  401: "身份验证失败",
  403: "访问被拒绝",
  404: "请求的接口不存在",
  408: "请求超时",
  429: "请求过于频繁，请稍后重试",
  500: "服务器内部错误",
  502: "网关错误",
  503: "服务暂时不可用",
  504: "网关超时",
};

/**
 * 全局错误处理配置
 */
let globalErrorConfig: ErrorToastConfig = {};

/**
 * 设置全局错误处理配置
 * @param config 错误处理配置
 */
export function setGlobalErrorConfig(config: ErrorToastConfig) {
  globalErrorConfig = { ...globalErrorConfig, ...config };
}

/**
 * 获取错误消息
 * @param error 错误对象
 * @returns 用户友好的错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || DEFAULT_ERROR_MESSAGES[error.code] || "操作失败";
  }

  if (error instanceof NetworkError) {
    if (error.status) {
      return NETWORK_ERROR_MESSAGES[error.status] || error.message;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "未知错误，请稍后重试";
}

/**
 * 处理API错误
 * @param error 错误对象
 * @param customMessage 自定义错误消息
 */
export function handleApiError(error: unknown, customMessage?: string) {
  const message = customMessage || getErrorMessage(error);

  if (error instanceof ApiError) {
    // 特殊处理某些业务错误码
    if (error.code === 401) {
      // 处理登录过期
      globalErrorConfig.showToast?.(message, "warning");
      // 可以在这里添加跳转到登录页的逻辑
      return;
    }

    if (globalErrorConfig.showApiError) {
      globalErrorConfig.showApiError(error);
    } else if (globalErrorConfig.showToast) {
      globalErrorConfig.showToast(message, "error");
    }
    return;
  }

  if (error instanceof NetworkError) {
    if (globalErrorConfig.showNetworkError) {
      globalErrorConfig.showNetworkError(error);
    } else if (globalErrorConfig.showToast) {
      globalErrorConfig.showToast(message, "error");
    }
    return;
  }

  // 其他错误
  globalErrorConfig.showToast?.(message, "error");
}

/**
 * 包装异步函数，自动处理错误
 * @param fn 异步函数
 * @param errorMessage 自定义错误消息
 * @returns 包装后的函数
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleApiError(error, errorMessage);
      throw error; // 重新抛出错误，让调用方决定是否需要额外处理
    }
  }) as T;
}

/**
 * 安全执行异步函数，不会抛出错误
 * @param fn 异步函数
 * @param errorMessage 自定义错误消息
 * @returns 执行结果，失败时返回null
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleApiError(error, errorMessage);
    return null;
  }
}

/**
 * 检查是否为特定的业务错误码
 * @param error 错误对象
 * @param code 错误码
 * @returns 是否匹配
 */
export function isApiErrorCode(error: unknown, code: number): boolean {
  return error instanceof ApiError && error.code === code;
}

/**
 * 检查是否为网络错误
 * @param error 错误对象
 * @returns 是否为网络错误
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * 检查是否为API业务错误
 * @param error 错误对象
 * @returns 是否为API业务错误
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
