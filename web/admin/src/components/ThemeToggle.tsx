import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    console.log('ThemeToggle mounted, current theme:', theme);
    console.log('HTML classList:', document.documentElement.classList.toString());
  }, [theme]);

  const handleClick = () => {
    console.log('Button clicked, current theme:', theme);
    console.log('HTML classList before toggle:', document.documentElement.classList.toString());
    toggleTheme();
    console.log('HTML classList after toggle:', document.documentElement.classList.toString());
  };

  return (
    <button
      onClick={handleClick}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition shadow"
      aria-label="切换主题"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );
}; 