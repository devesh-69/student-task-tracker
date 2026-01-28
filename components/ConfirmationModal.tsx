import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${
            variant === 'danger' ? 'bg-red-100 text-red-600' : 
            variant === 'warning' ? 'bg-amber-100 text-amber-600' : 
            'bg-blue-100 text-blue-600'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
             <p className="text-muted-foreground">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            onClick={onClose}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={
              variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' :
              variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
              'bg-primary hover:bg-primary/90 text-white'
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
