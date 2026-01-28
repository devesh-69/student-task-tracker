// Keyboard Shortcuts Hook
import { useEffect } from 'react';

interface ShortcutHandlers {
  onNewTask?: () => void;
  onSearch?: () => void;
  onHelp?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + K: New Task
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handlers.onNewTask?.();
      }

      // Ctrl/Cmd + /: Search
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        handlers.onSearch?.();
      }

      // ?: Help
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        handlers.onHelp?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
};
