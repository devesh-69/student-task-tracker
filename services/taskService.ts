import { Task, CreateTaskDTO } from '../types';
import { authService } from './authService';
import { localStorageService } from './localStorageService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...authService.getAuthHeader()
});

// Helper: Parse numbered lists from description into subtasks
function parseSubtasksFromDescription(description: string): { id: string; text: string; completed: boolean }[] {
  if (!description) return [];
  
  const lines = description.split('\n');
  const subtasks: { id: string; text: string; completed: boolean }[] = [];
  
  const patterns = [
    /^\d+\.\s+(.+)$/,
    /^\d+\)\s+(.+)$/,
    /^[-*]\s+(.+)$/
  ];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    for (const pattern of patterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        subtasks.push({
          id: crypto.randomUUID(), // Use crypto API for guaranteed uniqueness
          text: match[1].trim(),
          completed: false
        });
        break;
      }
    }
  });

  return subtasks;
}

export const taskService = {
  // Get all tasks - uses localStorage for guests, API for authenticated users
  getAllTasks: async (): Promise<Task[]> => {
    if (authService.isGuest()) {
      return localStorageService.getAllTasks();
    }

    const response = await fetch(`${API_URL}/tasks`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        return localStorageService.getAllTasks();
      }
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  },

  // Create task
  createTask: async (task: CreateTaskDTO): Promise<Task> => {
    const subtasks = parseSubtasksFromDescription(task.description);
    
    const taskData = {
      ...task,
      id: crypto.randomUUID(),
      subtasks,
      logs: [],
      createdAt: Date.now()
    };

    if (authService.isGuest()) {
      return localStorageService.createTask(taskData);
    }

    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        return localStorageService.createTask(taskData);
      }
      throw new Error('Failed to create task');
    }
    return response.json();
  },

  // Update task
  updateTask: async (id: string, updates: Partial<CreateTaskDTO>): Promise<Task> => {
    // Fetch current task to preserve subtask states
    const currentTask = authService.isGuest() 
      ? localStorageService.getTask(id)
      : await (async () => {
          try {
            const response = await fetch(`${API_URL}/tasks/${id}`, {
              method: 'GET',
              headers: getHeaders()
            });
            if (response.ok) return response.json();
          } catch (e) {}
          return null;
        })();
    
    let updateData = { ...updates };
    
    // Only re-parse subtasks if description actually changed
    if (updates.description && currentTask && updates.description !== currentTask.description) {
      const newSubtasks = parseSubtasksFromDescription(updates.description);
      
      // Preserve completion states for matching subtasks
      const preservedSubtasks = newSubtasks.map(newSub => {
        const existing = currentTask.subtasks?.find(old => old.text === newSub.text);
        return existing ? { ...newSub, completed: existing.completed, id: existing.id } : newSub;
      });
      
      updateData = { ...updates, subtasks: preservedSubtasks } as any;
    }

    if (authService.isGuest()) {
      const result = localStorageService.updateTask(id, updateData);
      if (!result) throw new Error('Task not found');
      return result;
    }

    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        const result = localStorageService.updateTask(id, updateData);
        if (!result) throw new Error('Task not found');
        return result;
      }
      throw new Error('Failed to update task');
    }
    return response.json();
  },

  // Toggle subtask completion
  toggleSubtask: async (taskId: string, subtaskId: string, completed: boolean, logMessage: string): Promise<Task> => {
    if (authService.isGuest()) {
      const result = localStorageService.toggleSubtask(taskId, subtaskId, completed, logMessage);
      if (!result) throw new Error('Task or subtask not found');
      return result;
    }

    const response = await fetch(`${API_URL}/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ completed, logMessage })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        const result = localStorageService.toggleSubtask(taskId, subtaskId, completed, logMessage);
        if (!result) throw new Error('Task or subtask not found');
        return result;
      }
      throw new Error('Failed to toggle subtask');
    }
    return response.json();
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    if (authService.isGuest()) {
      localStorageService.deleteTask(id);
      return;
    }

    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok && response.status !== 401) {
      throw new Error('Failed to delete task');
    }
  },

  // Clear all tasks
  clearAll: async (): Promise<void> => {
    if (authService.isGuest()) {
      localStorageService.clearAllTasks();
      return;
    }

    const response = await fetch(`${API_URL}/tasks`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok && response.status !== 401) {
      throw new Error('Failed to clear tasks');
    }
  },

  // Migrate guest tasks to database after login
  migrateGuestTasks: async (): Promise<{ success: number; failed: number }> => {
    if (authService.isGuest()) return { success: 0, failed: 0 };

    const guestTasks = localStorageService.getAllTasks();
    if (guestTasks.length === 0) return { success: 0, failed: 0 };

    const successfullyMigrated: string[] = [];
    const failedTasks: Array<{ task: Task; error: any }> = [];

    // Upload each task to the database and track results
    for (const task of guestTasks) {
      try {
        const response = await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(task)
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        // Confirm server accepted it
        await response.json();
        successfullyMigrated.push(task.id);
      } catch (error) {
        console.error('Failed to migrate task:', task.id, error);
        failedTasks.push({ task, error });
      }
    }

    // Only clear tasks that were SUCCESSFULLY migrated
    if (successfullyMigrated.length > 0) {
      const remainingTasks = guestTasks.filter(
        t => !successfullyMigrated.includes(t.id)
      );
      localStorageService.saveAllTasks(remainingTasks);
    }
    
    // If some tasks failed, throw error so UI can notify user
    if (failedTasks.length > 0) {
      throw new Error(
        `Failed to migrate ${failedTasks.length} task(s). They remain in local storage.`
      );
    }

    return { success: successfullyMigrated.length, failed: failedTasks.length };
  }
};