import React from 'react';
import { Dialog, DialogPanel, DialogTitle, Button } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'warning'
}) => {
  const { t } = useTranslation();
  
  // 使用翻译作为默认值
  const defaultConfirmText = confirmText || t('common.confirm');
  const defaultCancelText = cancelText || t('common.cancel');
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          confirmButtonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          confirmButtonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      case 'info':
        return {
          iconColor: 'text-blue-600',
          confirmButtonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
      default:
        return {
          iconColor: 'text-yellow-600',
          confirmButtonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
      
      {/* 对话框容器 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className={`flex-shrink-0 ${styles.iconColor}`}>
              <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </DialogTitle>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3 justify-end">
            <Button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {defaultCancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.confirmButtonColor}`}
            >
              {defaultConfirmText}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};