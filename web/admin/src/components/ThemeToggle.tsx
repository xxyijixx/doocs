import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    console.log('当前主题:', theme);
    console.log('HTML classList 切换前:', document.documentElement.classList);
    toggleTheme();
    // 在下一个事件循环中检查切换后的状态
    setTimeout(() => {
      console.log('HTML classList 切换后:', document.documentElement.classList);
    }, 0);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={`切换到${theme === 'light' ? '暗色' : '亮色'}模式`}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      ) : (
        <SunIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );
};