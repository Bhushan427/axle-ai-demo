import React from 'react';

type LoadStatus = 'open' | 'cancelled' | 'awaiting-arrival' | 'in-transit' | 'unloaded' | 'closed';
type BidStatus = 'placed' | 'awaiting' | 'won' | 'lost' | 'revised';

interface StatusBadgeProps {
  status: LoadStatus | BidStatus;
  label: string;
}

const statusStyles: Record<string, string> = {
  'open': 'bg-blue-50 text-blue-700 border border-blue-200',
  'cancelled': 'bg-gray-100 text-gray-600 border border-gray-300',
  'awaiting-arrival': 'bg-[#ED4136]/10 text-[#ED4136] border border-[#ED4136]/40',
  'in-transit': 'bg-green-50 text-green-700 border border-green-200',
  'unloaded': 'bg-purple-50 text-purple-700 border border-purple-200',
  'closed': 'bg-gray-100 text-gray-600 border border-gray-300',
  'placed': 'bg-blue-50 text-blue-700 border border-blue-200',
  'awaiting': 'bg-gray-100 text-gray-600 border border-gray-300',
  'won': 'bg-green-50 text-green-700 border border-green-200',
  'lost': 'bg-red-50 text-red-700 border border-red-200',
  'revised': 'bg-[#ED4136]/10 text-[#ED4136] border border-[#ED4136]/40',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        statusStyles[status] || statusStyles['open']
      }`}
    >
      {label}
    </span>
  );
}
