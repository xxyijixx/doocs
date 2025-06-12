/**
 * 欢迎页面 - 权限验证入口
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ExclamationTriangleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export const Welcome: React.FC = () => {
  const { isLoading, isAuthenticated, isAdmin, isAgent, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 如果已经认证且有权限，自动跳转到聊天页面
    if (isAuthenticated && (isAgent || isAdmin) && !isLoading) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, isAgent, isAdmin, isLoading, navigate]);

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner message="正在验证权限..." />
      </div>
    );
  }

  // 认证失败或无权限
  if (!isAuthenticated || error || (!isAgent && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              访问受限
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || '您没有访问客服系统的权限，请联系管理员获取相应权限。'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              重新验证
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 有权限但还未跳转的情况（通常不会显示，因为useEffect会自动跳转）
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            欢迎使用客服系统
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            正在为您跳转到聊天界面...
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            立即进入
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;