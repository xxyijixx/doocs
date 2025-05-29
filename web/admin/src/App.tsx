import React from 'react';
import { Chat } from './pages/Chat';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Chat />
      </div>
    </ThemeProvider>
  );
};

export default App;