import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskHistoryLog } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { CheckSquare, FileText, ScrollText, Lightbulb, MessageSquare, Bot } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, subtaskId: string, completed: boolean, logMessage: string) => Promise<void>;
}

// Helper to organize logs into threads
interface ThreadedLog extends TaskHistoryLog {
  children: TaskHistoryLog[];
}

const organizeLogsIntoThreads = (logs: TaskHistoryLog[]): ThreadedLog[] => {
  if (!logs || logs.length === 0) return [];
  
  // Create a map of parent logs
  const parentLogs: ThreadedLog[] = [];
  const childLogs: TaskHistoryLog[] = [];
  
  // Sort logs by timestamp (newest first already from backend)
  logs.forEach(log => {
    if (log.parentId) {
      childLogs.push(log);
    } else {
      parentLogs.push({ ...log, children: [] });
    }
  });
  
  // Attach children to their parents
  childLogs.forEach(child => {
    const parent = parentLogs.find(p => p.id === child.parentId);
    if (parent) {
      parent.children.push(child);
    } else {
      // Orphan child log - show as standalone
      parentLogs.push({ ...child, children: [] });
    }
  });
  
  // Sort by timestamp (newest first)
  return parentLogs.sort((a, b) => b.timestamp - a.timestamp);
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  task, 
  isOpen, 
  onClose,
  onUpdate 
}) => {
  const [logMessage, setLogMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  // Reset log message when task changes
  useEffect(() => {
    if (task) {
      setLogMessage('');
    }
  }, [task, isOpen]);

  // Organize logs into threads
  const threadedLogs = useMemo(() => {
    if (!task?.logs) return [];
    return organizeLogsIntoThreads(task.logs);
  }, [task?.logs]);

  if (!task) return null;

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    // Prevent duplicate requests for same subtask
    if (pendingUpdates.has(subtaskId)) {
      return;
    }
    
    // Mark this subtask as being updated
    setPendingUpdates(prev => new Set(prev).add(subtaskId));
    setIsSaving(true);
    
    try {
      // Pass the manual note (may be empty - backend handles logic)
      await onUpdate(task.id, subtaskId, completed, logMessage.trim());
      setLogMessage(''); // Clear after successful update
    } catch (error) {
      // Error already handled by parent component
      console.error('Failed to toggle subtask:', error);
    } finally {
      // Remove from pending updates
      setPendingUpdates(prev => {
        const next = new Set(prev);
        next.delete(subtaskId);
        return next;
      });
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title}>
      <div className="space-y-8">
        
        {/* Section 1: Checklist with Auto-Progress */}
        <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                <CheckSquare className="w-4 h-4" />
                <span>Checklist</span>
            </h4>
            {task.subtasks && task.subtasks.length > 0 ? (
              <div className="space-y-2">
                {task.subtasks.map((subtask, index) => (
                  <label 
                    key={subtask.id} 
                    className={`group flex items-center gap-3 p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors ${pendingUpdates.has(subtask.id) ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={(e) => handleToggleSubtask(subtask.id, e.target.checked)}
                      className="h-5 w-5 rounded border-2 border-primary/30 text-primary focus:ring-primary/50 cursor-pointer"
                      disabled={pendingUpdates.has(subtask.id)}
                    />
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {subtask.text}
                    </span>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {index + 1}/{task.subtasks.length}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground bg-secondary/20 rounded-xl">
                <Lightbulb className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                <p>No checklist items. Use numbered lists (1. 2. 3.) in the description to create a checklist.</p>
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="pt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${task.progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
        </div>

        {/* Section 2: Optional Note/Logging */}
        <div className="bg-accent/30 p-4 rounded-xl space-y-3 border border-border">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Add a note about this update (Optional):</span>
            </label>
            <textarea 
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g., Finished reading all chapters, Started coding..."
                value={logMessage}
                onChange={(e) => setLogMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your note will appear as a thread with checkbox updates nested under it
            </p>
        </div>

        {/* Section 3: Threaded Activity Log */}
        <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                <ScrollText className="w-4 h-4" />
                <span>Activity Log</span>
            </h4>
            <div className="bg-background border rounded-xl overflow-hidden max-h-[300px] overflow-y-auto relative">
                {threadedLogs.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        No activity recorded yet.
                    </div>
                ) : (
                    <ul className="divide-y">
                        {threadedLogs.map((log) => (
                            <li key={log.id} className="p-3 hover:bg-muted/50 transition-colors">
                                {/* Parent Log (Manual Note or Standalone System Log) */}
                                <div className="flex gap-3 text-sm">
                                    <div className={`mt-1 min-w-[6px] h-[6px] rounded-full ${log.isSystemLog ? 'bg-blue-400' : 'bg-primary'}`} />
                                    <div className="space-y-0.5 w-full">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex items-center gap-2">
                                                {log.isSystemLog ? (
                                                    <Bot className="w-3 h-3 text-blue-500" />
                                                ) : (
                                                    <MessageSquare className="w-3 h-3 text-primary" />
                                                )}
                                                <p className={`font-medium ${log.isSystemLog ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                    {log.message}
                                                </p>
                                            </div>
                                            <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground shrink-0">
                                                {log.progress}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(log.timestamp).toLocaleString(undefined, {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            })}
                                        </p>
                                        
                                        {/* Child Logs (Nested System Logs) */}
                                        {log.children && log.children.length > 0 && (
                                            <div className="mt-2 ml-4 pl-3 border-l-2 border-blue-200 space-y-2">
                                                {log.children.map((child) => (
                                                    <div key={child.id} className="flex gap-2 text-xs">
                                                        <Bot className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <p className="text-muted-foreground">{child.message}</p>
                                                                <span className="font-mono bg-secondary/50 px-1 py-0.5 rounded text-secondary-foreground shrink-0">
                                                                    {child.progress}%
                                                                </span>
                                                            </div>
                                                            <p className="text-muted-foreground/60 text-[10px]">
                                                                {new Date(child.timestamp).toLocaleString(undefined, {
                                                                    timeStyle: 'short'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

      </div>
    </Modal>
  );
};