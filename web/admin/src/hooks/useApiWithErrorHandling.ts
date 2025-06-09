/**
 * 带错误处理的API Hook
 */

import { useState, useCallback } from 'react';
import { handleApiError, safeExecute } from '../utils/errorHandler';

/**
 * 带错误处理的异步操作Hook
 * @param asyncFn 异步函数
 * @param options 配置选项
 */
export function useAsyncWithErrorHandling<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: {
    errorMessage?: string;
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: unknown) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const execute = useCallback(async (...args: Parameters<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn(...args);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      handleApiError(err, options.errorMessage);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, options]);

  const safeExecuteWrapper = useCallback(async (...args: Parameters<T>) => {
    setLoading(true);
    setError(null);
    
    const result = await safeExecute(
      () => asyncFn(...args),
      options.errorMessage
    );
    
    if (result !== null) {
      options.onSuccess?.(result);
    } else {
      options.onError?.(new Error('操作失败'));
    }
    
    setLoading(false);
    return result;
  }, [asyncFn, options]);

  return {
    execute,
    safeExecute: safeExecuteWrapper,
    loading,
    error,
  };
}

/**
 * API请求状态Hook
 */
export function useApiState<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const request = useCallback(async (apiCall: () => Promise<T>, errorMessage?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      handleApiError(err, errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const safeRequest = useCallback(async (apiCall: () => Promise<T>, errorMessage?: string) => {
    setLoading(true);
    setError(null);
    
    const result = await safeExecute(apiCall, errorMessage);
    
    if (result !== null) {
      setData(result);
    }
    
    setLoading(false);
    return result;
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    request,
    safeRequest,
    reset,
  };
}

/**
 * 表单提交Hook
 */
export function useFormSubmit<T = any>() {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const submit = useCallback(async (
    submitFn: () => Promise<T>,
    options: {
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
      successMessage?: string;
      errorMessage?: string;
    } = {}
  ) => {
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      const result = await submitFn();
      
      if (options.successMessage) {
        // 这里可以显示成功消息
        console.log('Success:', options.successMessage);
      }
      
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      setSubmitError(error);
      handleApiError(error, options.errorMessage);
      options.onError?.(error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submit,
    submitting,
    submitError,
  };
}