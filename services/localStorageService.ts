// LocalStorage Service - For guest users who aren't logged in
// Data persists in browser only

import { Task, CreateTaskDTO, TaskStatus } from '../types';

const TASKS_KEY = 'stt_guest_tasks';
const USER_KEY = 'stt_guest_user';
const API_KEY_STORAGE = 'stt_guest_apikey';

// Generate unique ID
const generateId = () => crypto.randomUUID();

export const localStorageService = {
  // --- TASKS ---
  
  getAllTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getTask: (id: string): Task | null => {
    const tasks = localStorageService.getAllTasks();
    return tasks.find(t => t.id === id) || null;
  },

  saveAllTasks: (tasks: Task[]): void => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  createTask: (taskData: CreateTaskDTO & { subtasks: any[], logs: any[] }): Task => {
    const tasks = localStorageService.getAllTasks();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      progress: 0,
      createdAt: Date.now(),
    };
    tasks.unshift(newTask);
    localStorageService.saveAllTasks(tasks);
    return newTask;
  },

  updateTask: (id: string, updates: Partial<Task>): Task | null => {
    const tasks = localStorageService.getAllTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    tasks[index] = { ...tasks[index], ...updates };
    localStorageService.saveAllTasks(tasks);
    return tasks[index];
  },

  toggleSubtask: (taskId: string, subtaskId: string, completed: boolean, logMessage: string): Task | null => {
    const tasks = localStorageService.getAllTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return null;

    // Toggle completion
    subtask.completed = completed;

    // Recalculate progress
    const completedCount = task.subtasks.filter(s => s.completed).length;
    task.progress = Math.round((completedCount / task.subtasks.length) * 100);

    // Update status
    if (task.progress === 100) task.status = TaskStatus.COMPLETED;
    else if (task.progress > 0) task.status = TaskStatus.IN_PROGRESS;
    else task.status = TaskStatus.PENDING;

    // Add log entry
    const systemLogMessage = `${completed ? 'Completed' : 'Unchecked'}: ${subtask.text}`;
    let parentId = null;

    if (logMessage && logMessage.trim()) {
      const noteId = crypto.randomUUID();
      task.logs.unshift({
        id: noteId,
        timestamp: Date.now(),
        message: logMessage.trim(),
        progress: task.progress,
        parentId: null,
        isSystemLog: false,
      });
      parentId = noteId;
    }

    task.logs.unshift({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      message: systemLogMessage,
      progress: task.progress,
      parentId: parentId,
      isSystemLog: true,
    });

    localStorageService.saveAllTasks(tasks);
    return task;
  },

  deleteTask: (id: string): boolean => {
    const tasks = localStorageService.getAllTasks();
    const filtered = tasks.filter(t => t.id !== id);
    localStorageService.saveAllTasks(filtered);
    return filtered.length < tasks.length;
  },

  clearAllTasks: (): void => {
    localStorage.removeItem(TASKS_KEY);
  },

  // --- USER PROFILE ---
  
  getUserProfile: (): { name: string } | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveUserProfile: (name: string): void => {
    localStorage.setItem(USER_KEY, JSON.stringify({ name }));
  },

  // --- API KEY ---
  
  getApiKey: (): string => {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  },

  saveApiKey: (key: string): void => {
    localStorage.setItem(API_KEY_STORAGE, key);
  },

  // --- MIGRATION ---
  
  // Get all guest data for migration to database
  getAllGuestData: () => ({
    tasks: localStorageService.getAllTasks(),
    user: localStorageService.getUserProfile(),
    apiKey: localStorageService.getApiKey(),
  }),

  // Clear all guest data after successful migration
  clearAllGuestData: (): void => {
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(API_KEY_STORAGE);
  }
};
