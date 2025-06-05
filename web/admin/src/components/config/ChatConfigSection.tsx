import React from "react";
import { Button, Input } from "@headlessui/react";
import {
  BoltIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
} from "@heroicons/react/20/solid";
import type { UserBot } from "../../types/dootask";
import type { SystemConfig } from "../../types/config";
import type { CustomerServiceSource } from "../../types/source";

interface ChatConfigSectionProps {
  systemConfig: SystemConfig;
  selectedUserBot: UserBot | null;
  sources: CustomerServiceSource[];
  newSourceName: string;
  isCreatingSource: boolean;
  onCreateProject: () => void;
  onResetSystemConfig: () => void;
  onCreateSource: () => void;
  onDeleteSource: (source: CustomerServiceSource) => void;
  onEditSource: (source: CustomerServiceSource) => void;
  setNewSourceName: (name: string) => void;
}

export const ChatConfigSection: React.FC<ChatConfigSectionProps> = ({
  systemConfig,
  selectedUserBot,
  sources,
  newSourceName,
  isCreatingSource,
  onCreateProject,
  onResetSystemConfig,
  onCreateSource,
  onDeleteSource,
  onEditSource,
  setNewSourceName,
}) => {
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
              !!systemConfig.dooTaskIntegration.projectId
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
                  !systemConfig.dooTaskIntegration.projectId ||
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
                          {source.sourceKey}
                        </code>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        项目ID: {source.projectId} | 任务ID: {source.taskId} | 对话ID: {source.dialogId}
                      </div>
                    </div>
                    <div className="flex gap-2">
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
    </section>
  );
};