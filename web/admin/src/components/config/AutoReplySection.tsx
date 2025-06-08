import React from "react";
import { Field, Label, Input, Textarea, Switch, Select } from "@headlessui/react";
import { ClockIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import type { SystemConfig } from "../../types/config";

interface AutoReplySectionProps {
  systemConfig: SystemConfig;
  onDefaultSourceConfigChange: (field: string, value: unknown) => void;
}

export const AutoReplySection: React.FC<AutoReplySectionProps> = ({
  systemConfig,
  onDefaultSourceConfigChange,
}) => {
  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="h-6 w-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          默认自动回复设置
        </h2>
      </div>
      <div className="space-y-4">
        <Field className="flex items-center gap-3">
          <Switch
            checked={systemConfig.default_source_config.auto_reply.enabled}
            onChange={(checked) =>
              onDefaultSourceConfigChange("auto_reply", {
                ...systemConfig.default_source_config.auto_reply,
                enabled: checked,
              })
            }
            className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[checked]:bg-blue-600"
          >
            <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5" />
          </Switch>
          <Label className="text-sm text-gray-700 dark:text-gray-300">
            启用自动回复
          </Label>
        </Field>

        <Field>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            延迟时间（秒）
          </Label>
          <Input
            type="number"
            min="0"
            value={systemConfig.default_source_config.auto_reply.delay}
            onChange={(e) =>
              onDefaultSourceConfigChange("auto_reply", {
                ...systemConfig.default_source_config.auto_reply,
                delay: parseInt(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!systemConfig.default_source_config.auto_reply.enabled}
          />
        </Field>

        <Field>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            自动回复消息
          </Label>
          <Textarea
            value={systemConfig.default_source_config.auto_reply.message}
            onChange={(e) =>
              onDefaultSourceConfigChange("auto_reply", {
                ...systemConfig.default_source_config.auto_reply,
                message: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
            disabled={!systemConfig.default_source_config.auto_reply.enabled}
          />
        </Field>

        {/* 默认客服分配设置 */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            客服分配设置
          </h3>
          
          <Field>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              分配方式
            </Label>
            <div className="relative">
              <Select
                value={systemConfig.default_source_config.agent_assignment.method}
                onChange={(e) =>
                  onDefaultSourceConfigChange("agent_assignment", {
                    ...systemConfig.default_source_config.agent_assignment,
                    method: e.target.value as "round-robin" | "least-busy" | "manual",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 appearance-none pr-10"
              >
                <option value="round-robin">轮询分配</option>
                <option value="least-busy">最少忙碌</option>
                <option value="manual">手动分配</option>
              </Select>
              <ChevronDownIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </Field>

          <Field>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              超时时间（秒）
            </Label>
            <Input
              type="number"
              min="0"
              value={systemConfig.default_source_config.agent_assignment.timeout}
              onChange={(e) =>
                onDefaultSourceConfigChange("agent_assignment", {
                  ...systemConfig.default_source_config.agent_assignment,
                  timeout: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
            />
          </Field>

          <Field>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              备用客服ID
            </Label>
            <Input
              type="number"
              min="0"
              value={
                systemConfig.default_source_config.agent_assignment
                  .fallback_agent_id || ""
              }
              onChange={(e) => {
                const value =
                  e.target.value === "" ? null : parseInt(e.target.value);
                onDefaultSourceConfigChange("agent_assignment", {
                  ...systemConfig.default_source_config.agent_assignment,
                  fallback_agent_id: value,
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
              placeholder="可选"
            />
          </Field>
        </div>
      </div>
    </section>
  );
};