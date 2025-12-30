import { useState, useCallback } from 'react';

export function useAlert() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    showCancel: true
  });

  const [toastState, setToastState] = useState({
    isOpen: false,
    message: '',
    type: 'info'
  });

  // Show modal (for confirmations/important actions)
  const showModal = useCallback((message, type = 'info', options = {}) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        message,
        type,
        showCancel: options.showCancel !== false,
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  });

  // Show toast (for non-blocking notifications)
  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    setToastState({
      isOpen: true,
      message,
      type
    });

    // Auto-close after duration
    setTimeout(() => {
      setToastState(prev => ({ ...prev, isOpen: false }));
    }, duration);
  });

  // Close toast manually
  const closeToast = useCallback(() => {
    setToastState(prev => ({ ...prev, isOpen: false }));
  });

  return {
    modalState,
    toastState,
    showModal,
    showToast,
    closeToast
  };
}

