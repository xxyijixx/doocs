import React from "react";
import { Field, Label, Input, Textarea } from "@headlessui/react";
import { CogIcon } from "@heroicons/react/20/solid";
import type { SystemConfig } from "../../types/config";

interface BasicConfigSectionProps {
  systemConfig: SystemConfig;
  onSystemConfigChange: (field: keyof SystemConfig, value: string) => void;
  onDefaultSourceConfigChange: (field: string, value: unknown) => void;
}

export const BasicConfigSection: React.FC<BasicConfigSectionProps> = ({
  systemConfig,
  onSystemConfigChange,
  onDefaultSourceConfigChange,
}) => {
  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <CogIcon className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          基本配置
        </h2>
      </div>
      <div className="space-y-4">
        <Field>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            服务名称
          </Label>
          <Input
            type="text"
            value={systemConfig.service_name}
            onChange={(e) => onSystemConfigChange("service_name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
            placeholder="请输入服务名称"
          />
        </Field>

        <Field>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            默认欢迎消息
          </Label>
          <Textarea
            value={systemConfig.default_source_config.welcome_message}
            onChange={(e) =>
              onDefaultSourceConfigChange("welcome_message", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 resize-none"
            rows={3}
            placeholder="请输入默认欢迎消息"
          />
        </Field>

        <Field>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            默认离线消息
          </Label>
          <Textarea
            value={systemConfig.default_source_config.offline_message}
            onChange={(e) =>
              onDefaultSourceConfigChange("offline_message", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 resize-none"
            rows={3}
            placeholder="请输入默认离线消息"
          />
        </Field>
      </div>
    </section>
  );
};