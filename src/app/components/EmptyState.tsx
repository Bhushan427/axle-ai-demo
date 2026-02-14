import React from 'react';
import { Package, FileX, Clock, AlertCircle } from 'lucide-react';

type EmptyStateType = 'no-loads' | 'no-bids' | 'no-actions' | 'expired' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  message?: string;
}

const emptyStateConfig: Record<EmptyStateType, { icon: React.ReactNode; defaultMessage: string }> = {
  'no-loads': {
    icon: <Package className="w-12 h-12 text-gray-300" />,
    defaultMessage: 'No loads found matching your criteria',
  },
  'no-bids': {
    icon: <FileX className="w-12 h-12 text-gray-300" />,
    defaultMessage: 'You haven\'t placed any bids yet',
  },
  'no-actions': {
    icon: <Clock className="w-12 h-12 text-gray-300" />,
    defaultMessage: 'No action points at the moment',
  },
  'expired': {
    icon: <Clock className="w-12 h-12 text-gray-300" />,
    defaultMessage: 'This load has expired',
  },
  'error': {
    icon: <AlertCircle className="w-12 h-12 text-red-400" />,
    defaultMessage: 'Something went wrong. Please try again.',
  },
};

export function EmptyState({ type, message }: EmptyStateProps) {
  const config = emptyStateConfig[type];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-3 text-center">
      <div className="flex justify-center mb-3">
        {config.icon}
      </div>
      <p className="text-gray-600 text-[14px]">{message || config.defaultMessage}</p>
    </div>
  );
}
