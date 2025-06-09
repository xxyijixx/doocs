import React, { useEffect, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Button,
} from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  BoltIcon,
  // SparklesIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
} from "@heroicons/react/20/solid";
import type { UserBot } from "../../types/dootask";
import type { SystemConfig, DooTaskChatConfig, ServerConfig } from "../../types/config";

interface BotConfigSectionProps {
  systemConfig: SystemConfig;
  dootaskChatConfig: DooTaskChatConfig;
  serverConfig: ServerConfig;
  userBots: UserBot[];
  selectedUserBot: UserBot | null;
  sourcesCount: number;
  onGetUserBotList: () => void;
  onCreateUserBot: () => void;
  onCreateProject: () => void;
  onResetSystemConfig: () => void;
  onSelectUserBot: (bot: UserBot | null) => void;
  onUpdateUserBot: (bot: UserBot) => void;
  onCheckProjectUser: (projectId: number, userId: number) => Promise<{projectUserIds: number[], result: boolean}>;
  onAddBotToProject: (projectId: number, botId: number, currentUserIds: number[]) => Promise<void>;
}

export const BotConfigSection: React.FC<BotConfigSectionProps> = ({
  systemConfig,
  dootaskChatConfig,
  serverConfig,
  userBots,
  selectedUserBot,
  sourcesCount,
  // onGetUserBotList,
  onCreateUserBot,
  onSelectUserBot,
  onUpdateUserBot,
  onCheckProjectUser,
  onAddBotToProject,
}) => {
  const DEFAULT_WEBHOOK_URL = `${serverConfig.base_url}/api/v1/dootask/${dootaskChatConfig.chat_key}/chat`;
  
  // 项目成员检查状态
  const [botInProject, setBotInProject] = useState<boolean | null>(null);
  const [projectUserIds, setProjectUserIds] = useState<number[]>([]);
  const [isCheckingProject, setIsCheckingProject] = useState(false);
  const [isAddingToProject, setIsAddingToProject] = useState(false);
  
  // 检查机器人是否在项目中
  const checkBotInProject = async (bot: UserBot | null) => {
    if (!bot || !systemConfig.dootask_integration.project_id) {
      setBotInProject(null);
      setProjectUserIds([]);
      return;
    }
    
    setIsCheckingProject(true);
    try {
      const result = await onCheckProjectUser(systemConfig.dootask_integration.project_id, bot.id);
      setBotInProject(result.result);
      setProjectUserIds(result.projectUserIds);
    } catch (error) {
      console.error('检查项目成员失败:', error);
      setBotInProject(null);
      setProjectUserIds([]);
    } finally {
      setIsCheckingProject(false);
    }
  };
  
  // 将机器人添加到项目
  const handleAddBotToProject = async () => {
    if (!selectedUserBot || !systemConfig.dootask_integration.project_id) return;
    
    setIsAddingToProject(true);
    try {
      await onAddBotToProject(
        systemConfig.dootask_integration.project_id,
        selectedUserBot.id,
        projectUserIds
      );
      // 重新检查项目成员状态
      await checkBotInProject(selectedUserBot);
    } catch (error) {
      console.error('添加机器人到项目失败:', error);
    } finally {
      setIsAddingToProject(false);
    }
  };
  
  // 处理机器人选择
  const handleSelectUserBot = (bot: UserBot | null) => {
    onSelectUserBot(bot);
    checkBotInProject(bot);
  };
  
  // 组件加载时检查当前选中的机器人
  useEffect(() => {
    checkBotInProject(selectedUserBot);
  }, [selectedUserBot, systemConfig.dootask_integration.project_id]);

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <BoltIcon className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          机器人配置
        </h2>
      </div>
      <div className="space-y-4">
        {/* 显示当前配置状态 */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            当前配置状态
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                机器人ID:
              </span>
              <span className="ml-2 font-mono">
                {systemConfig.dootask_integration.bot_id || "未设置"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">项目ID:</span>
              <span className="ml-2 font-mono">
                {systemConfig.dootask_integration.project_id || "未设置"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                来源数量:
              </span>
              <span className="ml-2 font-mono">{sourcesCount}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* <Button
            type="button"
            onClick={onGetUserBotList}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition data-[hover]:bg-blue-600 data-[focus]:ring-2 data-[focus]:ring-blue-500"
          >
            <SparklesIcon className="h-4 w-4" />
            获取机器人列表
          </Button> */}

          <div className="relative">
            <Listbox value={selectedUserBot} onChange={handleSelectUserBot}>
              <ListboxButton className="relative w-48 cursor-default rounded-md bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                <span className="flex items-center">
                  {selectedUserBot?.avatar && (
                    <img
                      src={selectedUserBot.avatar}
                      alt={selectedUserBot.name}
                      className="h-6 w-6 flex-shrink-0 rounded-full mr-2"
                    />
                  )}
                  <span className="block truncate text-gray-900 dark:text-white">
                    {selectedUserBot?.name || "未选择机器人"}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </ListboxButton>
              <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {userBots.map((bot) => (
                  <ListboxOption
                    key={bot.id}
                    value={bot}
                    className="group relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900 dark:text-white data-[focus]:bg-blue-600 data-[focus]:text-white"
                  >
                    <div className="flex items-center">
                      {bot.avatar && (
                        <img
                          src={bot.avatar}
                          alt={bot.name}
                          className="h-6 w-6 flex-shrink-0 rounded-full mr-2"
                        />
                      )}
                      <span className="block truncate font-normal group-data-[selected]:font-semibold">
                        {bot.name}
                      </span>
                    </div>
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </div>

          <Button
            type="button"
            onClick={onCreateUserBot}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition data-[hover]:bg-green-600 data-[focus]:ring-2 data-[focus]:ring-green-500"
          >
            <BoltIcon className="h-4 w-4" />
            创建机器人
          </Button>
        </div>
        
        {/* 项目成员检查状态 */}
        {selectedUserBot && systemConfig.dootask_integration.project_id && !botInProject && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
                {isCheckingProject ? (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    正在检查机器人是否在项目中...
                  </p>
                ) : botInProject === false ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        机器人 <strong>{selectedUserBot.name}(id:{selectedUserBot.id})</strong> 不在当前项目中
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddBotToProject}
                      disabled={isAddingToProject}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition data-[hover]:bg-blue-700 data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      {isAddingToProject ? '添加中...' : '将机器人添加到项目'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    无法检查项目成员状态
                  </p>
                )}
              </div>
          </div>
        )}
        
        {/* Webhook 配置状态和操作 */}
        {systemConfig.dootask_integration.create_task && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  已启用自动创建DooTask任务，请确保机器人有足够的权限。
                </p>
                
                {/* Webhook 状态显示和操作 */}
                {selectedUserBot && (
                  <div className="space-y-2">
                    {selectedUserBot.webhook_url === "" ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          未设置webhook URL，点击下方按钮设置默认webhook。
                        </p>
                        <Button
                          type="button"
                          onClick={() => {
                            onUpdateUserBot({
                              ...selectedUserBot,
                              webhook_url: DEFAULT_WEBHOOK_URL,
                            })
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition data-[hover]:bg-yellow-700 data-[focus]:ring-2 data-[focus]:ring-yellow-500 whitespace-nowrap"
                        >
                          <BoltIcon className="h-4 w-4" />
                          设置默认Webhook
                        </Button>
                      </div>
                    ) : selectedUserBot.webhook_url !== DEFAULT_WEBHOOK_URL ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            当前webhook: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 py-0.5 rounded text-xs">{selectedUserBot.webhook_url}</code>
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            webhook已设置，但不是默认值。如需重置为默认值，请点击右侧按钮。
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            onUpdateUserBot({
                              ...selectedUserBot,
                              webhook_url: DEFAULT_WEBHOOK_URL,
                            })
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition data-[hover]:bg-yellow-700 data-[focus]:ring-2 data-[focus]:ring-yellow-500 whitespace-nowrap"
                        >
                          <BoltIcon className="h-4 w-4" />
                          重置为默认
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Webhook已正确配置为默认值: <code className="bg-green-100 dark:bg-green-800 px-1 py-0.5 rounded text-xs">{DEFAULT_WEBHOOK_URL}</code>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
