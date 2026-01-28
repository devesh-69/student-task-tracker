import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskLongPress: (task: Task) => void;
}

const ITEMS_PER_PAGE = 12; // Load 12 tasks at a time

/**
 * TaskList Component with Infinite Scroll
 * Uses Intersection Observer for smart DOM rendering
 * Only renders visible + upcoming tasks to prevent DOM bloat
 */
export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick, onTaskLongPress }) => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset visible count when tasks array changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [tasks.length]);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && visibleCount < tasks.length) {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, tasks.length));
    }
  }, [visibleCount, tasks.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px', // Load next batch 100px before reaching bottom
      threshold: 0.1
    });

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [handleObserver]);

  // Empty state handling
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl border-muted bg-muted/10">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground">No tasks found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          You don't have any tasks tracked yet. Click the "Add Task" button to get started with your studies!
        </p>
      </div>
    );
  }

  const visibleTasks = tasks.slice(0, visibleCount);
  const hasMore = visibleCount < tasks.length;

  return (
    <div className="space-y-4">
      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onClick={onTaskClick}
            onLongPress={onTaskLongPress}
          />
        ))}
      </div>

      {/* Infinite Scroll Loader/Observer */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading more tasks... ({visibleCount}/{tasks.length})</span>
          </div>
        </div>
      )}

      {/* All Loaded Message */}
      {!hasMore && tasks.length > ITEMS_PER_PAGE && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          All {tasks.length} tasks loaded ✓
        </div>
      )}
    </div>
  );
};