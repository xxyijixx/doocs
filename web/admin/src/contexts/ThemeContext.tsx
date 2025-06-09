import React, { createContext, useContext, useState, useEffect } from 'react';
import {getThemeName} from '@dootask/tools';
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 从localStorage获取主题，如果没有则使用系统偏好
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme');
      if (storedPrefs) {
        return storedPrefs as Theme;
      }
      const theme = getThemeName()
      if (theme) {
        console.log("DooTask获取到的主题信息", theme)
        return theme as Theme;
      }
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }

    return 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`切换主题从 ${theme} 到 ${newTheme}`);
    setTheme(newTheme);
  };

  // 当主题变化时，更新DOM和localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};