import React from 'react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskLongPress: (task: Task) => void;
}

/**
 * TaskList Component
 * Displays a responsive grid of TaskItems.
 * Handles the "Empty State" if no tasks are present.
 */
export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick, onTaskLongPress }) => {
  // Empty state handling
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl border-muted bg-muted/10">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground">No tasks found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          You don't have any tasks tracked yet. Click the "Add Task" button to get started with your studies!
        </p>
      </div>
    );
  }

  // Grid layout: 1 column on mobile, 2 on tablet, 3 on desktop
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onClick={onTaskClick}
          onLongPress={onTaskLongPress}
        />
      ))}
    </div>
  );
};