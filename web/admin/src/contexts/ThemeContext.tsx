import React, { createContext, useContext, useState, useEffect } from 'react';

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
    
    // 移除旧主题类
    root.classList.remove('light', 'dark');
    // 添加新主题类
    root.classList.add(theme);
    
    // 保存到localStorage
    localStorage.setItem('theme', theme);
    
    console.log(`主题已更新为: ${theme}，classList:`, root.classList);
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