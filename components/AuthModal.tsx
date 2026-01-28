import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { localStorageService } from '../services/localStorageService';
import { LogIn, UserPlus, CheckCircle2 } from 'lucide-react';

import { useToast } from '../contexts/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess: (userName: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onSuccess 
}) => {
  const toast = useToast();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [name, setName] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let response;
      if (mode === 'login') {
        response = await authService.login(email, password);
      } else {
        response = await authService.register(name, email, password);
      }

      // Success!
      // Migrate guest tasks if any
      const guestTasks = localStorageService.getAllTasks();
      if (guestTasks.length > 0) {
        const loadingToastId = toast.loading(`Syncing ${guestTasks.length} offline tasks to database...`);
        
        try {
          const result = await taskService.migrateGuestTasks();
          toast.dismiss(loadingToastId);
          
          if (result.success > 0) {
            toast.success(`Successfully synced ${result.success} task(s)!`);
          }
        } catch (error: any) {
          toast.dismiss(loadingToastId);
          toast.error(error.message || 'Some tasks failed to sync. They remain saved locally.');
        }
      } else {
        toast.success(`Welcome back, ${response.user.name}!`);
      }
      
      // Notify parent
      onSuccess(response.user.name);
      
      // Close modal
      onClose();
      
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === 'login' ? 'Welcome Back' : 'Create Account'}
    >
      <div className="space-y-4">
        {/* Header/Description */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
            {mode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' 
              ? 'Login to sync your tasks and access them anywhere.' 
              : 'Register to securely save your progress to the cloud.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Devesh Tatkare"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              title="Please enter a valid email address (e.g., user@example.com)"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="text-center pt-2">
          <button 
            type="button"
            onClick={toggleMode}
            className="text-sm text-primary hover:underline"
          >
            {mode === 'login' 
              ? "Don't have an account? Register" 
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
