import React, { useState } from "react";
import { Button, Input } from "@headlessui/react";
import {
  BoltIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/20/solid";
import type { UserBot } from "../../types/dootask";
import type { SystemConfig, ServerConfig } from "../../types/config";
import type { CustomerServiceSource } from "../../types/source";

interface ChatConfigSectionProps {
  systemConfig: SystemConfig;
  selectedUserBot: UserBot | null;
  sources: CustomerServiceSource[];
  newSourceName: string;
  isCreatingSource: boolean;
  serverConfig: ServerConfig;
  onCreateProject: () => void;
  onResetSystemConfig: () => void;
  onCreateSource: () => void;
  onDeleteSource: (source: CustomerServiceSource) => void;
  onEditSource: (source: CustomerServiceSource) => void;
  setNewSourceName: (name: string) => void;
  onUpdateCreateTask: (enabled: boolean) => void;
}

export const ChatConfigSection: React.FC<ChatConfigSectionProps> = ({
  systemConfig,
  selectedUserBot,
  sources,
  newSourceName,
  isCreatingSource,
  serverConfig,
  onCreateProject,
  onResetSystemConfig,
  onCreateSource,
  onDeleteSource,
  onEditSource,
  setNewSourceName,
  onUpdateCreateTask,
}) => {
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<CustomerServiceSource | null>(null);
  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <BoltIcon className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          聊天配置
        </h2>
      </div>
      <div className="space-y-4">

        <div className="flex flex-wrap gap-4">
          <Button
            type="button"
            onClick={onCreateProject}
            disabled={
              !selectedUserBot ||
              !!systemConfig.dootask_integration.project_id
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition data-[hover]:bg-blue-600 data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SparklesIcon className="h-4 w-4" />
            创建项目
          </Button>

          <Button
            type="button"
            onClick={onResetSystemConfig}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition data-[hover]:bg-red-600 data-[focus]:ring-2 data-[focus]:ring-red-500"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            重置系统配置
          </Button>
        </div>

        {/* DooTask 任务配置 */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          {/* <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            DooTask 任务配置
          </h3> */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="create_task"
                checked={systemConfig.dootask_integration.create_task}
                onChange={(e) => onUpdateCreateTask(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="create_task"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                自动创建 DooTask 任务
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              启用后，当有新的客服对话时，系统将自动在 DooTask 中创建对应的任务。
            </p>
          </div>
        </div>

        {/* 来源管理 */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            来源管理
          </h3>

          {/* 创建新来源 */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="请输入来源名称"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                />
              </div>
              <Button
                type="button"
                onClick={onCreateSource}
                disabled={
                  isCreatingSource ||
                  !selectedUserBot ||
                  !systemConfig.dootask_integration.project_id ||
                  !newSourceName.trim()
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingSource ? (
                  <CogIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
                {isCreatingSource ? "创建中..." : "创建来源"}
              </Button>
            </div>
          </div>

          {/* 来源列表 */}
          {sources.length > 0 && (
            <div className="space-y-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="bg-white dark:bg-gray-600 p-4 rounded-md border border-gray-200 dark:border-gray-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        {source.name}
                      </h4>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>来源Key: </span>
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {source.source_key}
                        </code>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        项目ID: {source.project_id} | 任务ID: {source.task_id} | 对话ID: {source.dialog_id}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedSource(source);
                          setShowUsageModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        <QuestionMarkCircleIcon className="h-3 w-3" />
                        使用说明
                      </Button>
                      <Button
                        type="button"
                        onClick={() => onEditSource(source)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        <PencilIcon className="h-3 w-3" />
                        编辑
                      </Button>
                      <Button
                        type="button"
                        onClick={() => onDeleteSource(source)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        <TrashIcon className="h-3 w-3" />
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 使用说明弹窗 */}
      {showUsageModal && selectedSource && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Widget 使用说明</h3>
              <Button
                type="button"
                onClick={() => {
                  setShowUsageModal(false);
                  setSelectedSource(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">1. 在您的网页中添加以下代码：</h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
{`<!-- 配置全局参数 -->
<script>
    // 手动配置 baseUrl 和 source
    window.WIDGET_CONFIG = {
        // 后端服务地址
        baseUrl: '${serverConfig.base_url}',
        
        // 当前来源的source key 
        source: '${selectedSource.source_key}'
    };
</script>

<!-- 引入widget脚本 -->
<script src="${serverConfig.base_url}/widget/bundle.js" defer></script>
`}
                  </pre>
                </div>
              </div>
              
              <div>
                 <h4 className="font-medium text-gray-800 dark:text-white mb-2">2. 当前来源信息：</h4>
                 <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                   <p className="text-sm text-gray-600 dark:text-gray-400">
                     <strong>来源名称：</strong>{selectedSource.name}
                   </p>
                   <p className="text-sm text-gray-600 dark:text-gray-400">
                     <strong>Source Key：</strong>
                     <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded ml-1">{selectedSource.source_key}</code>
                   </p>
                 </div>
               </div>
              
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">3. 下载 Widget 文件：</h4>
                <Button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `${serverConfig.base_url}/widget/bundle.js?download=true`;
                    link.download = 'bundle.js';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  下载 bundle.js
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  您也可以直接在网页中引用在线地址，或下载文件到本地服务器使用。
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
               <Button
                 type="button"
                 onClick={() => {
                   setShowUsageModal(false);
                   setSelectedSource(null);
                 }}
                 className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
               >
                 关闭
               </Button>
             </div>
          </div>
        </div>
      )}
    </section>
  );
};