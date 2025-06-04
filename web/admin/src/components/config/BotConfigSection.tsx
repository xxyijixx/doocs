import React from "react";
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
} from "@heroicons/react/20/solid";
import type { UserBot } from "../../types/dootask";
import type { SystemConfig } from "../../types/config";

interface BotConfigSectionProps {
  systemConfig: SystemConfig;
  userBots: UserBot[];
  selectedUserBot: UserBot | null;
  sourcesCount: number;
  onGetUserBotList: () => void;
  onCreateUserBot: () => void;
  onCreateProject: () => void;
  onResetSystemConfig: () => void;
  onSelectUserBot: (bot: UserBot | null) => void;
}

export const BotConfigSection: React.FC<BotConfigSectionProps> = ({
  systemConfig,
  userBots,
  selectedUserBot,
  sourcesCount,
  // onGetUserBotList,
  onCreateUserBot,
  onSelectUserBot,
}) => {
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
                {systemConfig.dooTaskIntegration.botId || "未设置"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                项目ID:
              </span>
              <span className="ml-2 font-mono">
                {systemConfig.dooTaskIntegration.projectId || "未设置"}
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
            <Listbox value={selectedUserBot} onChange={onSelectUserBot}>
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
      </div>
    </section>
  );
};