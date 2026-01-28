import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { User, Key, Shield, AlertTriangle, LogIn, UserPlus } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';

interface ChangeNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string, apiKey?: string) => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export const ChangeNameModal: React.FC<ChangeNameModalProps> = ({ 
  isOpen, 
  onClose, 
  currentName, 
  onSave,
  onLoginClick,
  onRegisterClick
}) => {
  const toast = useToast();
  const [name, setName] = useState(currentName);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [updateApiKey, setUpdateApiKey] = useState(false);
  const isGuest = authService.isGuest();

  // Update local state when currentName changes
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setApiKey('');
      setUpdateApiKey(false);
      setShowApiKey(false);
    }
  }, [currentName, isOpen]);

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

    // Only pass API key if user chose to update it
    const newApiKey = updateApiKey && apiKey.trim() ? apiKey.trim() : undefined;
    onSave(name.trim(), newApiKey);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Guest Warning Banner */}
        {isGuest && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  Guest Mode - Data Not Saved to Cloud
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Your progress is stored in this browser only. Clear browser data = lost progress.
                  We are not responsible for any data loss.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={onRegisterClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-primary border border-primary rounded-md hover:bg-primary/5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Register
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Icon */}
        <div className="flex items-center justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <User className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-4">
        {/* Security Warning for Guests */}
        {isGuest && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-amber-900">
                  ⚠️ Security Warning: Guest Mode
                </p>
                <p className="text-xs text-amber-800">
                  Your API key is stored in <strong>plain text</strong> in browser localStorage. 
                  It can be accessed by browser extensions or malicious scripts.
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  <strong>Recommendation:</strong> Create a free account to encrypt and securely store your API key on our servers.
                </p>
              </div>
            </div>
          </div>
        )}

          <label htmlFor="newName" className="text-sm font-medium">
            Your Name
          </label>
          <input
            type="text"
            id="newName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Enter your name"
            autoFocus
            required
          />
        </div>

        {/* API Key Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="updateApiKey"
              checked={updateApiKey}
              onChange={(e) => setUpdateApiKey(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="updateApiKey" className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              Update API Key
            </label>
          </div>

          {updateApiKey && (
            <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <label htmlFor="apiKey" className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Gemini API Key
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
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono text-xs"
                placeholder="AIzaSy... (leave empty to keep current)"
              />
              {isGuest ? (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  API key stored in browser (not secure). Login to encrypt.
                </p>
              ) : (
                <p className="text-xs text-blue-700 flex items-center gap-1">
                  <span>•</span>
                  Stored encrypted using AES-256
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            type="button" 
            onClick={onClose}
            className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
