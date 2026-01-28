import React, { useState, useEffect } from 'react';
import { Task, CreateTaskDTO, TaskStatus } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { geminiService } from '../services/geminiService';
import { authService } from '../services/authService';
import { LogIn, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: CreateTaskDTO) => Promise<void>;
  onCancel: () => void;
  onLoginRequest?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel, onLoginRequest }) => {
  const [formData, setFormData] = useState<CreateTaskDTO>({
    title: '',
    description: '',
    deadline: '',
    status: TaskStatus.PENDING,
    progress: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingAI, setIsGettingAI] = useState(false);
  const isGuest = authService.isGuest();

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        deadline: initialData.deadline,
        status: initialData.status,
        progress: initialData.progress
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const updates: any = {
      [name]: name === 'progress' ? parseInt(value) || 0 : value
    };
    
    // Auto-sync: Set progress to 100% when marking as Completed
    if (name === 'status' && value === TaskStatus.COMPLETED) {
      updates.progress = 100;
    }
    
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleAIHelp = async () => {
    if (!formData.title) return;
    
    // Warn user if they have description content
    if (formData.description && formData.description.trim().length > 0) {
      const confirmReplace = window.confirm(
        "AI Assist will replace your current description. Do you want to continue?"
      );
      if (!confirmReplace) return;
    }
    
    setIsGettingAI(true);
    const suggestion = await geminiService.suggestBreakdown(formData.title, formData.description);
    // Replace description with AI suggestion
    setFormData(prev => ({ ...prev, description: suggestion }));
    setIsGettingAI(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Guest Warning Banner */}
      {isGuest && !initialData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs mb-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-medium text-amber-800">You are not logged in.</span>
            <span className="text-amber-700 block mt-0.5">
              Tasks are stored locally and may be lost if you clear browser data.
              API key is not encrypted.
            </span>
            {onLoginRequest && (
              <button 
                type="button"
                onClick={onLoginRequest}
                className="text-primary hover:underline font-medium mt-1 flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                Login to secure your data
              </button>
            )}
          </div>
        </div>
      )}

      <Input
        id="title"
        name="title"
        label="Task Title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g., Complete MCA Assignment"
        required
      />
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <div className="relative">
            <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Add numbered steps: 1) First step, 2) Second step..."
            />
            {/* AI Helper Button */}
            <button
                type="button"
                onClick={handleAIHelp}
                disabled={isGettingAI || !formData.title}
                className="absolute right-2 bottom-2 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                title="Generate subtasks with AI"
            >
                {isGettingAI ? (
                    <span className="animate-pulse">Thinking...</span>
                ) : (
                    <>
                     <Sparkles className="w-3 h-3" />
                     <span>AI Assist</span>
                    </>
                )}
            </button>
        </div>
        {/* Preview detected checklist items */}
        {(() => {
          const lines = formData.description.split('\n');
          const detectedCount = lines.filter(line => line.trim().match(/^(\d+)[.)]\s*(.+)$/)).length;
          return detectedCount > 0 ? (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md">
              <CheckCircle className="w-3 h-3" />
              <span className="font-medium">Detected {detectedCount} checklist {detectedCount === 1 ? 'item' : 'items'}</span>
            </div>
          ) : null;
        })()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="deadline"
          name="deadline"
          type="date"
          label="Deadline"
          value={formData.deadline}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />
        <Select
          id="status"
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: TaskStatus.PENDING, label: 'Pending' },
            { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
            { value: TaskStatus.COMPLETED, label: 'Completed' },
          ]}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>{initialData ? 'Update Task' : 'Create Task'}</Button>
      </div>
    </form>
  );
};
