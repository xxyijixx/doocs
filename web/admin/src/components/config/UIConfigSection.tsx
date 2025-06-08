import React from "react";
import {
  Field,
  Label,
  Input,
  RadioGroup,
  Radio,
  Fieldset,
  Legend,
} from "@headlessui/react";
import { PaintBrushIcon } from "@heroicons/react/20/solid";
import type { SystemConfig } from "../../types/config";

interface UIConfigSectionProps {
  systemConfig: SystemConfig;
  onDefaultSourceConfigChange: (field: string, value: unknown) => void;
}

export const UIConfigSection: React.FC<UIConfigSectionProps> = ({
  systemConfig,
  onDefaultSourceConfigChange,
}) => {
  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <PaintBrushIcon className="h-6 w-6 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          默认界面设置
        </h2>
      </div>
      <div className="space-y-4">
        <Field>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            主题颜色
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={systemConfig.default_source_config.ui.primary_color}
              onChange={(e) =>
                onDefaultSourceConfigChange("ui", {
                  ...systemConfig.default_source_config.ui,
                  primary_color: e.target.value,
                })
              }
              className="h-10 w-10 border-0 p-0 data-[focus]:ring-2 data-[focus]:ring-blue-500"
            />
            <Input
              type="text"
              value={systemConfig.default_source_config.ui.primary_color}
              onChange={(e) =>
                onDefaultSourceConfigChange("ui", {
                  ...systemConfig.default_source_config.ui,
                  primary_color: e.target.value,
                })
              }
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              placeholder="#RRGGBB"
            />
          </div>
        </Field>

        <Field>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Logo URL
          </Label>
          <Input
            type="url"
            value={systemConfig.default_source_config.ui.logo_url}
            onChange={(e) =>
              onDefaultSourceConfigChange("ui", {
                ...systemConfig.default_source_config.ui,
                logo_url: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
            placeholder="https://example.com/logo.png"
          />
        </Field>

        <Fieldset>
          <Legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            聊天气泡位置
          </Legend>
          <RadioGroup
            value={systemConfig.default_source_config.ui.chat_bubble_position}
            onChange={(value) =>
              onDefaultSourceConfigChange("ui", {
                ...systemConfig.default_source_config.ui,
                chat_bubble_position: value,
              })
            }
            className="flex gap-4"
          >
            <Field className="flex items-center">
              <Radio
                value="left"
                className="group flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white data-[checked]:bg-blue-600 data-[focus]:outline-none data-[focus]:ring-2 data-[focus]:ring-blue-500 data-[focus]:ring-offset-2"
              >
                <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
              </Radio>
              <Label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                左侧
              </Label>
            </Field>
            <Field className="flex items-center">
              <Radio
                value="right"
                className="group flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white data-[checked]:bg-blue-600 data-[focus]:outline-none data-[focus]:ring-2 data-[focus]:ring-blue-500 data-[focus]:ring-offset-2"
              >
                <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
              </Radio>
              <Label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                右侧
              </Label>
            </Field>
          </RadioGroup>
        </Fieldset>
      </div>
    </section>
  );
};