import React, { useEffect, useState, useRef } from 'react';
import { TaskList } from '../components/TaskList';
import { TaskForm } from '../components/TaskForm';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { TaskActionMenu } from '../components/TaskActionMenu';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { ChangeNameModal } from '../components/ChangeNameModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { AuthModal } from '../components/AuthModal';
import { Footer } from '../components/Footer';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { localStorageService } from '../services/localStorageService';
import { Task, CreateTaskDTO } from '../types';
import { playSuccessSound } from '../services/audioService';
import { GraduationCap, AlertTriangle, CheckCircle2, Hand, LogOut, LogIn } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

// Declare global confetti function (added via script tag in index.html)
declare global {
  interface Window {
    confetti: any;
  }
}

/**
 * Home Page Component
 * Main controller for the Student Task Tracker.
 * Manages state for tasks, loading, modals, and single-source-of-truth logic.
 */
export const Home: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(authService.isGuest());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // User Profile State
  const [userName, setUserName] = useState<string>(() => {
    if (!authService.isGuest()) {
      const user = authService.getUser();
      return user?.name || 'Student';
    }
    const profile = localStorageService.getUserProfile();
    return profile?.name || 'Student';
  });
  
  // Online/Offline Detection
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [clearDataCountdown, setClearDataCountdown] = useState(10);
  const [isChangeNameOpen, setIsChangeNameOpen] = useState(false); // Separate from onboarding
  const [deleteConfirmationState, setDeleteConfirmationState] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null,
  });
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  // Interaction States
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [longPressedTask, setLongPressedTask] = useState<Task | null>(null);

  // Celebration State
  const hasCelebrated = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      // Guest mode - load from localStorage
      // Authenticated mode - load from API
      // No redirects - guests can use the app!
      
      // Check if authenticated user's token is expired
      if (!authService.isGuest() && !authService.isAuthenticated()) {
        toast.error("Your session has expired. Logging you out...");
        authService.logout();
        setUserName(null);
        // Reload page to reset state
        setTimeout(() => window.location.reload(), 2000);
        return;
      }
      
      // Load user name
      if (!authService.isGuest()) {
        const user = authService.getUser();
        if (user) setUserName(user.name);
      } else {
        const profile = localStorageService.getUserProfile();
        if (profile) setUserName(profile.name);
      }

      // Load Tasks (service handles guest vs authenticated)
      try {
        const data = await taskService.getAllTasks();
        setTasks(data);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        toast.error('Failed to load tasks. Working offline?');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []); // Run once on mount

  // Online/Offline Detection Effect
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleOnboardingSave = async (name: string, apiKey?: string) => {
    try {
      await userService.saveProfile(name);
      
      // Save API key if provided (will be encrypted in backend)
      if (apiKey && apiKey.trim()) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await fetch(`${API_URL}/apikey`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...authService.getAuthHeader()
          },
          body: JSON.stringify({ key: apiKey.trim() })
        });
      }
      
      setUserName(name);
      // Update stored user
      const currentUser = authService.getUser();
      if (currentUser) {
        authService.updateUser({ ...currentUser, name });
      }
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error("Failed to save profile", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile. Please try again.");
    }
  };

  // Handle Logout (only for authenticated users)
  const handleLogout = () => {
    authService.logout();
    setIsGuest(true);
    setUserName('Student');
    // Refresh tasks from localStorage
    setTasks(localStorageService.getAllTasks());
    toast.info('Logged out successfully.');
  };

  // Handle Login/Register button click
  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsChangeNameOpen(false); // Close settings if open
  };

  const handleAuthSuccess = (name: string) => {
    setIsGuest(false);
    setUserName(name);
    // Refresh tasks to show migrated data
    // (This might need a slight delay or just refetch)
    setTimeout(() => fetchTasks(), 500);
  };

  // --- DATA FETCHING ---
  const fetchTasks = async () => {
    // Only set loading on initial fetch to prevent UI flicker on updates
    if (tasks.length === 0) setIsLoading(true);
    try {
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      toast.error("Unable to load tasks. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- CALCULATION: OVERALL PROGRESS ---
  const calculateOverallProgress = () => {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((acc, task) => acc + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  };

  const progressPercentage = calculateOverallProgress();

  // --- EFFECT: CELEBRATION ---
  useEffect(() => {
    // Check if we celebrated recently (within 24 hours)
    const lastCelebrationStr = localStorage.getItem('lastCelebration');
    const lastCelebration = lastCelebrationStr ? parseInt(lastCelebrationStr) : 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const canCelebrateAgain = Date.now() - lastCelebration > oneDayMs;
    
    if (progressPercentage === 100 && tasks.length > 0 && !hasCelebrated.current && canCelebrateAgain) {
      triggerCelebration();
      hasCelebrated.current = true;
      localStorage.setItem('lastCelebration', Date.now().toString());
    } else if (progressPercentage < 100) {
      hasCelebrated.current = false;
    }
  }, [progressPercentage, tasks.length]);

  const triggerCelebration = () => {
    playSuccessSound();
    if (window.confetti) {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            window.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            window.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }
  };

  // --- HANDLERS: CRUD ---

  const handleCreate = async (data: CreateTaskDTO) => {
    try {
      await taskService.createTask(data);
      await fetchTasks();
      setIsFormModalOpen(false);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error("Failed to create task", error);
      toast.error(error instanceof Error ? error.message : "Failed to create task. Please try again.");
    }
  };

  const handleUpdate = async (data: CreateTaskDTO) => {
    if (!editingTask) return;
    try {
      await taskService.updateTask(editingTask.id, data);
      await fetchTasks();
      setIsFormModalOpen(false);
      setEditingTask(undefined);
      setLongPressedTask(null);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error("Failed to update task", error);
      toast.error(error instanceof Error ? error.message : "Failed to update task. Please try again.");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmationState({ isOpen: true, taskId: id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteConfirmationState.taskId;
    if (!id || isDeletingTask) return;
    
    setIsDeletingTask(true);
    try {
      await taskService.deleteTask(id);
      await fetchTasks();
      setLongPressedTask(null);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error("Failed to delete task", error);
      toast.error("Failed to delete task. Please try again.");
    } finally {
      setIsDeletingTask(false);
      setDeleteConfirmationState({ isOpen: false, taskId: null });
    }
  };

  const handleProgressUpdate = async (taskId: string, subtaskId: string, completed: boolean, logMessage: string) => {
    try {
        await taskService.toggleSubtask(taskId, subtaskId, completed, logMessage);
        // Refresh all tasks to get updated progress and status
        const freshData = await taskService.getAllTasks();
        setTasks(freshData);
        // Update the selected task in detail modal
        const freshSelected = freshData.find(t => t.id === taskId);
        if (freshSelected) {
            setSelectedTaskForDetail(freshSelected);
        }
    } catch (e) {
        console.error("Failed to update subtask", e);
        toast.error("Could not update checklist. Please try again.");
    }
  };

  // --- HANDLERS: UI ---
  const openCreateModal = () => {
    setEditingTask(undefined);
    setIsFormModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setLongPressedTask(null);
    setIsFormModalOpen(true);
  };

  const handleChangeName = () => {
    setIsChangeNameOpen(true); // Open the name change modal, NOT onboarding
  };

  const handleSaveNewName = async (newName: string, apiKey?: string) => {
    try {
      await userService.saveProfile(newName);
      
      // Save API key if provided (will be encrypted in backend)
      if (apiKey && apiKey.trim()) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await fetch(`${API_URL}/apikey`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...authService.getAuthHeader()
          },
          body: JSON.stringify({ key: apiKey.trim() })
        });
      }
      
      setUserName(newName);
      setIsChangeNameOpen(false);
      toast.success('Settings saved!');
    } catch (error) {
      console.error("Failed to save settings", error);
      toast.error(error instanceof Error ? error.message : "Failed to save settings. Please try again.");
    }
  };

  const handleClearData = () => {
    setShowClearDataModal(true);
    setClearDataCountdown(10); // Reset to 10 every time modal opens
  };

  const handleCancelClearData = () => {
    setShowClearDataModal(false);
    setClearDataCountdown(10); // Reset when cancelled
  };

  const handleConfirmClearData = async () => {
    try {
      // Only clear tasks and user profile, NOT logs or API keys
      await taskService.clearAll();
      setTasks([]);
      setShowClearDataModal(false);
      setClearDataCountdown(10); // Reset after clearing
      toast.success("All tasks cleared successfully! Logs and API key preserved.");
    } catch (error) {
      console.error("Failed to clear data", error);
      toast.error("Failed to clear data. Please try again.");
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (showClearDataModal && clearDataCountdown > 0) {
      const timer = setTimeout(() => {
        setClearDataCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showClearDataModal && clearDataCountdown === 0) {
      handleConfirmClearData();
    }
  }, [showClearDataModal, clearDataCountdown]);

  // --- RENDER ---
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  return (
    <>
    <div className="min-h-screen bg-background pb-24 select-none">
      {/* Offline Indicator Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[10002] bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium shadow-md flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          <span>You're offline. Working in local mode.</span>
        </div>
      )}
      
      {/* Navbar - Mobile Optimized */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"  style={{ marginTop: isOnline ? '0' : '40px' }}>
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">
              <span className="hidden sm:inline">Student Task Tracker</span>
              <span className="sm:hidden">Task Tracker</span>
            </h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* User Name Button */}
            <button 
              onClick={handleChangeName} 
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/50"
            >
              <span className="max-w-[60px] sm:max-w-none truncate">{userName}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </button>

            {/* Clear Data Button (Only for guests or if strictly needed) */}
            <button 
              onClick={handleClearData} 
              className="text-xs sm:text-sm font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50"
              title="Clear all tasks"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              <span className="hidden sm:inline">Clear</span>
            </button>

            {/* Auth Buttons */}
            {isGuest ? (
               <button 
               onClick={() => handleAuthClick('login')} 
               className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20"
               title="Login to save progress"
             >
               <LogIn className="w-4 h-4" />
               <span className="hidden sm:inline">Login</span>
             </button>
            ) : (
              <button 
                onClick={handleLogout} 
                className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Welcome Section */}
        <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-2 p-6 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg relative overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
             </div>

             <h2 className="text-2xl font-bold mb-2 relative z-10 flex items-center gap-2">
               Welcome Back, {userName}! 
               <Hand className="w-6 h-6" />
             </h2>
             <p className="opacity-90 mb-6 relative z-10">Track your academic goals efficiently.</p>
             
             <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-sm font-medium opacity-90">
                    <span>Overall Progress</span>
                    <span>{progressPercentage}%</span>
                </div>
                {/* Dynamic Progress Bar */}
                <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${progressPercentage === 100 ? 'bg-green-400' : 'bg-white'}`} 
                        style={{ width: `${progressPercentage}%` }} 
                    />
                </div>
             </div>
          </div>

          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-center">
             <span className="text-sm font-medium text-muted-foreground">Pending</span>
             <span className="text-3xl font-bold mt-2">{pendingTasks}</span>
          </div>
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-center">
             <span className="text-sm font-medium text-muted-foreground">Completed</span>
             <span className="text-3xl font-bold mt-2 text-green-600">{completedTasks}</span>
          </div>
        </section>

        {/* Task List */}
        <div>
            <h2 className="text-xl font-semibold tracking-tight mb-4">Your Tasks</h2>
            {isLoading ? (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
            ) : (
            <TaskList 
                tasks={tasks} 
                onTaskClick={(task) => setSelectedTaskForDetail(task)}
                onTaskLongPress={(task) => setLongPressedTask(task)}
            />
            )}
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={openCreateModal} />

      {/* --- MODALS & OVERLAYS --- */}

      {/* 2. Create/Edit Form Modal */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)}
        title={editingTask ? "Edit Task" : "Create New Task"}
      >
        <TaskForm
          initialData={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={() => setIsFormModalOpen(false)}
          onLoginRequest={() => {
            setIsFormModalOpen(false);
            handleAuthClick('login');
          }}
        />
      </Modal>

      {/* 3. Detail View Modal (Update + Log) */}
      <TaskDetailModal
        isOpen={!!selectedTaskForDetail}
        task={selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        onUpdate={handleProgressUpdate}
      />

      {/* 4. Long Press Context Menu */}
      <TaskActionMenu
        task={longPressedTask}
        onClose={() => setLongPressedTask(null)}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* 5. Clear Data Countdown Modal */}
      <Modal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        title="Clear All Data"
      >
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            <h3 className="text-lg font-semibold">Warning: Destructive Action</h3>
            
            <p className="text-sm text-muted-foreground">
              This will permanently delete all tasks and user settings.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Activity logs and API keys will be preserved</span>
              </p>
            </div>
            
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
              <div className="text-6xl font-bold text-red-600 tabular-nums">
                {clearDataCountdown}
              </div>
              <p className="text-sm text-red-700 mt-2">
                Auto-clearing in {clearDataCountdown} second{clearDataCountdown !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleCancelClearData}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmClearData}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>

    {/* Change Name Modal - Separate from Onboarding */}
    <ChangeNameModal
      isOpen={isChangeNameOpen}
      onClose={() => setIsChangeNameOpen(false)}
      currentName={userName}
      onSave={handleSaveNewName}
      onLoginClick={() => handleAuthClick('login')}
      onRegisterClick={() => handleAuthClick('register')}
    />

    {/* Auth Modal (Login/Register) */}
    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      initialMode={authMode}
      onSuccess={handleAuthSuccess}
    />
    
    {/* Delete Confirmation Modal */}
    <ConfirmationModal
      isOpen={deleteConfirmationState.isOpen}
      onClose={() => setDeleteConfirmationState({ isOpen: false, taskId: null })}
      onConfirm={handleConfirmDelete}
      title="Delete Task"
      message="Are you sure you want to delete this task? This action cannot be undone."
      confirmLabel="Delete"
      variant="danger"
    />

    {/* Footer with Attribution */}
    <Footer />
    </>
  );
};