/**
 * 权限验证Hook
 */

import { useState, useEffect } from 'react';
import { verifyUserPermission, type UserPermission } from '../api/auth';

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  userInfo: UserPermission | null;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    isAgent: false,
    userInfo: null,
    error: null,
  });

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const userInfo = await verifyUserPermission();
      
      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        isAdmin: userInfo.is_admin,
        isAgent: userInfo.is_agent,
        userInfo,
        error: null,
      });
    } catch (error: any) {
      console.error('权限验证失败:', error);
      
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        isAgent: false,
        userInfo: null,
        error: error.message || '权限验证失败',
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    ...authState,
    refetch: checkAuth,
  };
}