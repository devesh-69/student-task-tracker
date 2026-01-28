// Define the status enum as per requirements
export enum TaskStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed'
  }
  
// Interface for tracking progress changes (with threading support)
export interface TaskHistoryLog {
  id: string;
  timestamp: number;
  message: string;
  progress: number;
  parentId?: string | null; // For threading: links to parent note
  isSystemLog?: boolean; // true = auto checkbox log, false = manual note
}
  
  // Interface for checklist items (subtasks)
  export interface Subtask {
    id: string;
    text: string;
    completed: boolean;
  }
  
  // Interface for the Task entity
  export interface Task {
    id: string;
    title: string;
    description: string;
    subtasks: Subtask[]; // Auto-detected from numbered lists
    deadline: number; // Unix timestamp in milliseconds
    status: TaskStatus;
    progress: number; // 0 to 100, auto-calculated from subtasks
    createdAt: number;
    logs: TaskHistoryLog[]; // History of changes
  }
  
  // Interface for creating a new task (omits auto-generated fields)
  export interface CreateTaskDTO {
    title: string;
    description: string;
    deadline: number; // Unix timestamp in milliseconds
    status: TaskStatus;
    progress: number;
  }

  // Interface for User Profile (Persisted User Info)
  export interface UserProfile {
    name: string;
    hasOnboarded: boolean;
  }
  
  // AI Service Response Types
  export interface AISuggestionResponse {
    suggestion: string;
    subtasks?: string[];
  }