import { useCallback } from 'react';

export const useScrollToBottom = () => {
  const scrollToBottom = useCallback(() => {
    // Small delay to ensure the keyboard is open
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  }, []);

  return scrollToBottom;
};
