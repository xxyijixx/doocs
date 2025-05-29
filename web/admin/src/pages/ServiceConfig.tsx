import React, { useState, useEffect } from 'react';
import type { CustomerServiceConfig } from '../types/config';

export const ServiceConfig: React.FC = () => {
  // 默认配置
  const defaultConfig: CustomerServiceConfig = {
    serviceName: '客服中心',
    welcomeMessage: '欢迎来到客服中心，请问有什么可以帮助您的？',
    offlineMessage: '当前客服不在线，请留言，我们会尽快回复您。',
    
    workingHours: {
      enabled: true,
      startTime: '09:00',
      endTime: '18:00',
      workDays: [1, 2, 3, 4, 5], // 周一到周五
    },
    
    autoReply: {
      enabled: true,
      delay: 30,
      message: '您好，客服正在处理其他问题，请稍等片刻。',
    },
    
    agentAssignment: {
      method: 'round-robin',
      timeout: 60,
      fallbackAgentId: null,
    },
    
    ui: {
      primaryColor: '#3B82F6',
      logoUrl: '',
      chatBubblePosition: 'right',
    },
  };

  // 状态管理
  const [config, setConfig] = useState<CustomerServiceConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 模拟从API加载配置
  useEffect(() => {
    // 在实际应用中，这里应该调用API获取配置
    const loadConfig = async () => {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 这里应该是API返回的数据
        // 暂时使用默认配置
        setConfig(defaultConfig);
        setIsLoading(false);
      } catch (error) {
        console.error('加载配置失败:', error);
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 这里应该是保存配置的API调用
      console.log('保存配置:', config);
      
      setSaveMessage({
        type: 'success',
        text: '配置已成功保存！'
      });
    } catch (error) {
      console.error('保存配置失败:', error);
      setSaveMessage({
        type: 'error',
        text: '保存配置失败，请重试。'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 处理基本字段变化
  const handleBasicChange = (field: keyof CustomerServiceConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理嵌套对象字段变化
  const handleNestedChange = (section: keyof CustomerServiceConfig, field: string, value: any) => {
    setConfig(prev => {
      const sectionData = prev[section];
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value
          }
        };
      }
      return prev;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载配置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">客服系统配置</h1>
      
      {saveMessage && (
        <div className={`mb-6 p-4 rounded-md ${
          saveMessage.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
        }`}>
          {saveMessage.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">基本设置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                服务名称
              </label>
              <input
                type="text"
                value={config.serviceName}
                onChange={(e) => handleBasicChange('serviceName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                欢迎消息
              </label>
              <textarea
                value={config.welcomeMessage}
                onChange={(e) => handleBasicChange('welcomeMessage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                离线消息
              </label>
              <textarea
                value={config.offlineMessage}
                onChange={(e) => handleBasicChange('offlineMessage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                required
              />
            </div>
          </div>
        </section>
        
        {/* 工作时间设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">工作时间设置</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="workingHoursEnabled"
                checked={config.workingHours.enabled}
                onChange={(e) => handleNestedChange('workingHours', 'enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="workingHoursEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                启用工作时间限制
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  开始时间
                </label>
                <input
                  type="time"
                  value={config.workingHours.startTime}
                  onChange={(e) => handleNestedChange('workingHours', 'startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={!config.workingHours.enabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  结束时间
                </label>
                <input
                  type="time"
                  value={config.workingHours.endTime}
                  onChange={(e) => handleNestedChange('workingHours', 'endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={!config.workingHours.enabled}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                工作日
              </label>
              <div className="flex flex-wrap gap-2">
                {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => (
                  <label key={index} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={config.workingHours.workDays.includes(index)}
                      onChange={(e) => {
                        const newWorkDays = e.target.checked
                          ? [...config.workingHours.workDays, index]
                          : config.workingHours.workDays.filter(d => d !== index);
                        handleNestedChange('workingHours', 'workDays', newWorkDays);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!config.workingHours.enabled}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* 自动回复设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">自动回复设置</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoReplyEnabled"
                checked={config.autoReply.enabled}
                onChange={(e) => handleNestedChange('autoReply', 'enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoReplyEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                启用自动回复
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                延迟时间（秒）
              </label>
              <input
                type="number"
                min="0"
                value={config.autoReply.delay}
                onChange={(e) => handleNestedChange('autoReply', 'delay', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={!config.autoReply.enabled}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                自动回复消息
              </label>
              <textarea
                value={config.autoReply.message}
                onChange={(e) => handleNestedChange('autoReply', 'message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                disabled={!config.autoReply.enabled}
              />
            </div>
          </div>
        </section>
        
        {/* 客服分配设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">客服分配设置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                分配方式
              </label>
              <select
                value={config.agentAssignment.method}
                onChange={(e) => handleNestedChange('agentAssignment', 'method', e.target.value as 'round-robin' | 'least-busy' | 'manual')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="round-robin">轮询分配</option>
                <option value="least-busy">最少忙碌</option>
                <option value="manual">手动分配</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                超时时间（秒）
              </label>
              <input
                type="number"
                min="0"
                value={config.agentAssignment.timeout}
                onChange={(e) => handleNestedChange('agentAssignment', 'timeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                备用客服ID
              </label>
              <input
                type="number"
                min="0"
                value={config.agentAssignment.fallbackAgentId || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseInt(e.target.value);
                  handleNestedChange('agentAssignment', 'fallbackAgentId', value);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="可选"
              />
            </div>
          </div>
        </section>
        
        {/* 界面设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">界面设置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                主题颜色
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={config.ui.primaryColor}
                  onChange={(e) => handleNestedChange('ui', 'primaryColor', e.target.value)}
                  className="h-10 w-10 border-0 p-0 mr-2"
                />
                <input
                  type="text"
                  value={config.ui.primaryColor}
                  onChange={(e) => handleNestedChange('ui', 'primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  placeholder="#RRGGBB"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                value={config.ui.logoUrl}
                onChange={(e) => handleNestedChange('ui', 'logoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                聊天气泡位置
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bubblePosition"
                    value="left"
                    checked={config.ui.chatBubblePosition === 'left'}
                    onChange={() => handleNestedChange('ui', 'chatBubblePosition', 'left')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">左侧</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bubblePosition"
                    value="right"
                    checked={config.ui.chatBubblePosition === 'right'}
                    onChange={() => handleNestedChange('ui', 'chatBubblePosition', 'right')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">右侧</span>
                </label>
              </div>
            </div>
          </div>
        </section>
        
        {/* 提交按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSaving ? (
              <>
                <span className="inline-block animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                保存中...
              </>
            ) : '保存配置'}
          </button>
        </div>
      </form>
    </div>
  );
};