import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { Button } from '@headlessui/react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      className="relative p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 group overflow-hidden"
      aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
    >
      <div className="relative w-5 h-5">
        {/* 太阳图标 */}
        <SunIcon 
          className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 transform ${
            theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-180 scale-75'
          }`} 
        />
        {/* 月亮图标 */}
        <MoonIcon 
          className={`absolute inset-0 w-5 h-5 text-blue-500 transition-all duration-300 transform ${
            theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-180 scale-75'
          }`} 
        />
      </div>
      
      {/* 背景动画效果 */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20'
          : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'
      } opacity-0 group-hover:opacity-100`} />
    </Button>
  );
};