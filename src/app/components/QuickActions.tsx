import React from 'react';
import { Search, FileText, AlertCircle, TruckIcon } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const quickActions = [
  { id: 'search', label: 'Search Loads', icon: Search, text: 'Search load from Delhi to Mumbai' },
  { id: 'bids', label: 'My Bids', icon: FileText, text: 'Show all loads where I have placed bids' },
  { id: 'actions', label: 'Action Points', icon: AlertCircle, text: 'Show action points on me' },
  { id: 'attach', label: 'Attach Vehicle', icon: TruckIcon, text: 'I want to attach vehicle' },
];

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="mb-4">
      <p className="text-gray-600 text-[13px] mb-3 px-1">Quick actions:</p>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.text)}
            className="bg-white border border-gray-200 rounded-xl p-3 hover:border-[#FF4D00] hover:bg-orange-50 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <action.icon className="w-4 h-4 text-gray-600 group-hover:text-[#FF4D00]" />
              <span className="font-medium text-gray-900 text-[13px]">{action.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
