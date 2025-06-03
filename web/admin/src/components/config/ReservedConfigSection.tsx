import React from "react";
import { Field, Label, Input, Textarea } from "@headlessui/react";
import { PaintBrushIcon } from "@heroicons/react/20/solid";
import type { SystemConfig } from "../../types/config";

interface ReservedConfigSectionProps {
  systemConfig: SystemConfig;
  onSystemConfigChange: (field: keyof SystemConfig, value: string) => void;
}

export const ReservedConfigSection: React.FC<ReservedConfigSectionProps> = ({
  systemConfig,
  onSystemConfigChange,
}) => {
  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <PaintBrushIcon className="h-6 w-6 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          预留配置
        </h2>
      </div>
      <div className="space-y-4">
        <Field>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            预留字段1
          </Label>
          <Input
            type="text"
            value={systemConfig.reserved1 || ""}
            onChange={(e) =>
              onSystemConfigChange("reserved1", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
            placeholder="预留字段1"
          />
        </Field>
        <Field>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            预留字段2
          </Label>
          <Textarea
            value={systemConfig.reserved2 || ""}
            onChange={(e) =>
              onSystemConfigChange("reserved2", e.target.value)
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
            placeholder="预留字段2"
          />
        </Field>
      </div>
    </section>
  );
};