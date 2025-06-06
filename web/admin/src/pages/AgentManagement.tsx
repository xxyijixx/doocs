/**
 * 客服管理页面
 */

import { useState, useEffect } from 'react';
import { getAgentList, setAgents } from '../api/auth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { MessageAlert } from '../components/common/MessageAlert';
import { PlusIcon, UserIcon } from '@heroicons/react/24/outline';

interface Agent {
  id: number;
  username: string;
  name: string;
  avatar: string;
  dootask_user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AgentManagement() {
  const [agents, setAgentsState] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newUserIds, setNewUserIds] = useState<string>('');

  // 加载客服列表
  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const data = await getAgentList();
      setAgentsState(data || []);
    } catch (error: any) {
      console.error('加载客服列表失败:', error);
      setMessage({ type: 'error', text: error.message || '加载客服列表失败' });
    } finally {
      setIsLoading(false);
    }
  };

  // 设置客服
  const handleSetAgents = async () => {
    if (!newUserIds.trim()) {
      setMessage({ type: 'error', text: '请输入DooTask用户ID' });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);
      
      // 解析用户ID列表
      const userIds = newUserIds
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      if (userIds.length === 0) {
        setMessage({ type: 'error', text: '请输入有效的用户ID' });
        return;
      }

      await setAgents(userIds);
      setMessage({ type: 'success', text: '客服设置成功' });
      setNewUserIds('');
      
      // 重新加载客服列表
      await loadAgents();
    } catch (error: any) {
      console.error('设置客服失败:', error);
      setMessage({ type: 'error', text: error.message || '设置客服失败' });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="加载客服列表中..." />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">客服管理</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            管理客服人员，设置DooTask用户为客服。
          </p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className="mb-6">
            <MessageAlert
              message={message}
            />
          </div>
        )}

        {/* 添加客服 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            添加客服
          </h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                DooTask用户ID（多个用逗号分隔）
              </label>
              <input
                type="text"
                value={newUserIds}
                onChange={(e) => setNewUserIds(e.target.value)}
                placeholder="例如: 1001, 1002, 1003"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isSaving}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSetAgents}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    设置中...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    设置客服
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 客服列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              客服列表 ({agents.length})
            </h2>
          </div>
          
          {agents.length === 0 ? (
            <div className="p-8 text-center">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无客服人员</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                请添加DooTask用户ID来设置客服
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {agents.map((agent) => (
                <div key={agent.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {agent.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={agent.avatar}
                          alt={agent.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {agent.name || agent.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        用户名: {agent.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        DooTask ID: {agent.dootask_user_id}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        agent.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}
                    >
                      {agent.status === 'active' ? '活跃' : '非活跃'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}