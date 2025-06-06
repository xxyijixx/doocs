/**
 * 权限保护组件
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PermissionGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // 是否需要管理员权限
  requireAgent?: boolean; // 是否需要客服权限
  fallback?: React.ReactNode; // 无权限时显示的内容
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requireAdmin = false,
  requireAgent = false,
  fallback,
}) => {
  const { isLoading, isAuthenticated, isAdmin, isAgent, error } = useAuth();

  // 加载中
  if (isLoading) {
    return <LoadingSpinner message="验证权限中..." />;
  }

  // 认证失败
  if (!isAuthenticated || error) {
    return (
      fallback || (
        <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
              访问被拒绝
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              {error || '您没有访问此页面的权限'}
            </p>
            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                重新验证
              </button>
            </div>
          </div>
        </div>
      )
    );
  }

  // 权限检查
  const hasPermission = () => {
    if (requireAdmin && !isAdmin) {
      return false;
    }
    if (requireAgent && !isAgent && !isAdmin) {
      // 管理员也可以访问需要客服权限的页面
      return false;
    }
    return true;
  };

  // 无权限
  if (!hasPermission()) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-full mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
              权限不足
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              {requireAdmin 
                ? '此页面仅限管理员访问' 
                : '此页面仅限客服人员访问'
              }
            </p>
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                当前权限：
                {isAdmin && <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs mr-1">管理员</span>}
                {isAgent && <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs mr-1">客服</span>}
                {!isAdmin && !isAgent && <span className="text-gray-500">无</span>}
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  // 有权限，渲染子组件
  return <>{children}</>;
};