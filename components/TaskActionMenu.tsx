import React, { useEffect, useRef } from 'react';
import { Task } from '../types';

interface TaskActionMenuProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

/**
 * TaskActionMenu Component
 * Displays the "Sub Menu" options (Edit/Delete) when a task is Long Pressed.
 * Renders as a bottom sheet on mobile or a centered dialog on desktop.
 */
export const TaskActionMenu: React.FC<TaskActionMenuProps> = ({ task, onClose, onEdit, onDelete }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (task) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [task, onClose]);

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        ref={menuRef}
        className="w-full max-w-sm bg-card rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200"
      >
        <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold text-center text-sm text-muted-foreground">Options for "{task.title}"</h3>
        </div>
        <div className="p-2 space-y-1">
            <button 
                onClick={() => onEdit(task)}
                className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-accent transition-colors"
            >
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </div>
                <div>
                    <span className="block font-medium">Edit Task</span>
                    <span className="block text-xs text-muted-foreground">Modify details or deadline</span>
                </div>
            </button>

            <button 
                onClick={() => onDelete(task.id)}
                className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group"
            >
                <div className="p-2 bg-red-100 text-red-600 rounded-full group-hover:bg-red-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </div>
                <div>
                    <span className="block font-medium text-destructive">Delete Task</span>
                    <span className="block text-xs text-muted-foreground">Permanently remove this task</span>
                </div>
            </button>
        </div>
        <div className="p-2 border-t">
            <button 
                onClick={onClose}
                className="w-full py-3 text-center font-medium rounded-lg hover:bg-accent"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};