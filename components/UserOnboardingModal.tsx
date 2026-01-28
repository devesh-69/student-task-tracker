import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Key } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface UserOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void; // Now accepts onClose
  onSave: (name: string, apiKey?: string) => void;
}

export const UserOnboardingModal: React.FC<UserOnboardingModalProps> = ({ isOpen, onClose, onSave }) => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    onSave(name.trim(), apiKey.trim() || undefined);
    setName('');
    setApiKey('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to Task Tracker!">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-2 mb-6">
          <p className="text-muted-foreground">
            Let's personalize your experience
          </p>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., John Smith"
            required
          />
        </div>

        {/* API Key Input (Optional) */}
        <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <label htmlFor="apiKey" className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Gemini API Key (Optional)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-xs text-primary hover:underline"
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            type={showApiKey ? 'text' : 'password'}
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            pattern="AIza[0-9A-Za-z-_]{35}"
            title="API key should start with 'AIza' and be 39 characters long"
            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono text-xs"
            placeholder="AIzaSyC..."
          />
          <div className="flex items-start gap-2 text-xs text-blue-700">
            <span>•</span>
            <p>Stored encrypted in database using AES-256</p>
          </div>
          <div className="flex items-start gap-2 text-xs text-blue-700">
            <span>•</span>
            <p>You can add this later in settings</p>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Get Started
        </Button>
      </form>
    </Modal>
  );
};