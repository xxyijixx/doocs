import React from "react";
import { Field, Label, Input, Switch } from "@headlessui/react";
import { ClockIcon } from "@heroicons/react/20/solid";
import type { SystemConfig } from "../../types/config";

interface WorkingHoursSectionProps {
  systemConfig: SystemConfig;
  onDefaultSourceConfigChange: (field: string, value: unknown) => void;
}

export const WorkingHoursSection: React.FC<WorkingHoursSectionProps> = ({
  systemConfig,
  onDefaultSourceConfigChange,
}) => {
  const weekDays = [
    { value: 1, label: "周一" },
    { value: 2, label: "周二" },
    { value: 3, label: "周三" },
    { value: 4, label: "周四" },
    { value: 5, label: "周五" },
    { value: 6, label: "周六" },
    { value: 0, label: "周日" },
  ];

  const handleWorkDayChange = (dayValue: number, checked: boolean) => {
    const currentWorkDays = systemConfig.default_source_config.working_hours.work_days;
    let newWorkDays;
    
    if (checked) {
      newWorkDays = [...currentWorkDays, dayValue];
    } else {
      newWorkDays = currentWorkDays.filter(day => day !== dayValue);
    }
    
    onDefaultSourceConfigChange("working_hours", {
      ...systemConfig.default_source_config.working_hours,
      work_days: newWorkDays,
    });
  };

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="h-6 w-6 text-green-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          默认工作时间设置
        </h2>
      </div>
      <div className="space-y-4">
        <Field className="flex items-center gap-3">
          <Switch
            checked={systemConfig.default_source_config.working_hours.enabled}
            onChange={(checked) =>
              onDefaultSourceConfigChange("working_hours", {
                ...systemConfig.default_source_config.working_hours,
                enabled: checked,
              })
            }
            className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[checked]:bg-blue-600"
          >
            <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5" />
          </Switch>
          <Label className="text-sm text-gray-700 dark:text-gray-300">
            启用工作时间限制
          </Label>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              开始时间
            </Label>
            <Input
              type="time"
              value={systemConfig.default_source_config.working_hours.start_time}
              onChange={(e) =>
                onDefaultSourceConfigChange("working_hours", {
                  ...systemConfig.default_source_config.working_hours,
                  start_time: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!systemConfig.default_source_config.working_hours.enabled}
            />
          </Field>

          <Field>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              结束时间
            </Label>
            <Input
              type="time"
              value={systemConfig.default_source_config.working_hours.end_time}
              onChange={(e) =>
                onDefaultSourceConfigChange("working_hours", {
                  ...systemConfig.default_source_config.working_hours,
                  end_time: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!systemConfig.default_source_config.working_hours.enabled}
            />
          </Field>
        </div>

        <Field>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            工作日
          </Label>
          <div className="flex flex-wrap gap-4">
            {weekDays.map((day) => (
              <Field key={day.value} className="flex items-center gap-2">
                <Switch
                  checked={systemConfig.default_source_config.working_hours.work_days.includes(
                    day.value
                  )}
                  onChange={(checked) => handleWorkDayChange(day.value, checked)}
                  disabled={!systemConfig.default_source_config.working_hours.enabled}
                  className="group relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[checked]:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-4" />
                </Switch>
                <Label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {day.label}
                </Label>
              </Field>
            ))}
          </div>
        </Field>
      </div>
    </section>
  );
};