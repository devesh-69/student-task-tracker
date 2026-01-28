import React, { useRef, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { ProgressBar } from './ui/ProgressBar';

interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
  onLongPress: (task: Task) => void;
}

/**
 * TaskItem Component
 * 
 * INTERACTION LOGIC:
 * - Click: Opens the Detail View (Logs + Interactive Progress)
 * - Long Press (500ms): Opens the Context Menu (Edit/Delete)
 * 
 * Uses TouchEvents and MouseEvents to distinguish between tap and hold.
 */
export const TaskItem: React.FC<TaskItemProps> = ({ task, onClick, onLongPress }) => {
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED;
  
  // Long press logic refs and state
  // Fixed: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to avoid namespace error in environments without Node types
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggered = useRef(false);
  const [isPressing, setIsPressing] = useState(false);

  const startPress = () => {
    setIsPressing(true);
    isLongPressTriggered.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      onLongPress(task);
      // Haptic feedback if available on mobile
      if (navigator.vibrate) navigator.vibrate(50);
      setIsPressing(false); // Reset visual state after trigger
    }, 500); // 500ms threshold for long press
  };

  const endPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // If long press was triggered, do not fire normal click
    if (isLongPressTriggered.current) {
      e.stopPropagation();
      return; 
    }
    onClick(task);
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-green-100 text-green-800">Completed</span>;
      case TaskStatus.IN_PROGRESS:
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-blue-100 text-blue-800">In Progress</span>;
      default:
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-gray-100 text-gray-800">Pending</span>;
    }
  };

  // Helper to calculate remaining days text
  const getDaysRemainingText = (deadline: string) => {
    if (task.status === TaskStatus.COMPLETED) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null; // Overdue handled by badge
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  const daysLeft = getDaysRemainingText(task.deadline);

  return (
    <div 
      className={`
        relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 select-none cursor-pointer
        ${isPressing ? 'scale-[0.98] bg-accent/50 ring-2 ring-primary/20' : 'hover:shadow-md'}
      `}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onClick={handleClick}
      // Prevent default context menu on right click for better mobile simulation
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold leading-none tracking-tight text-lg line-clamp-1" title={task.title}>{task.title}</h3>
                {isOverdue && (
                     <span className="shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">Overdue</span>
                )}
            </div>
            {task.subtasks && task.subtasks.length > 0 ? (
                <div className="space-y-0.5 mt-1">
                  {task.subtasks.slice(0, 2).map((subtask) => (
                    <div key={subtask.id} className="flex items-center text-xs text-muted-foreground gap-2">
                       <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${subtask.completed ? 'bg-green-400' : 'bg-gray-300'}`} />
                       <span className={`truncate ${subtask.completed ? 'line-through opacity-70' : ''}`}>{subtask.text}</span>
                    </div>
                  ))}
                  {task.subtasks.length > 2 && (
                    <p className="text-xs text-muted-foreground/60 pl-3.5">+ {task.subtasks.length - 2} more steps</p>
                  )}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
            )}
          </div>
          <div className="shrink-0">
             {getStatusBadge(task.status)}
          </div>
        </div>
        
        <div className="space-y-2 pointer-events-none"> {/* Progress bar is purely visual here, interactive in detail modal */}
            <ProgressBar progress={task.progress} showLabel />
        </div>

        <div className="flex items-center justify-between pt-2 border-t mt-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
            {daysLeft && <span className="opacity-75">({daysLeft})</span>}
          </div>
          <div className="text-xs text-primary font-medium opacity-60">
             Hold to Edit
          </div>
        </div>
      </div>
    </div>
  );
};