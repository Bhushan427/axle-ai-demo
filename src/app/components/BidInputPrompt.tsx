import React, { useState } from 'react';
import { IndianRupee } from 'lucide-react';

interface BidInputPromptProps {
  onSubmit: (amount: number) => void;
  onCancel?: () => void;
  defaultValue?: number;
  label?: string;
}

export function BidInputPrompt({ onSubmit, onCancel, defaultValue, label = 'Enter your bid amount' }: BidInputPromptProps) {
  const [amount, setAmount] = useState(defaultValue?.toString() || '');

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onSubmit(numAmount);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 mb-3">
      <h3 className="font-semibold text-gray-900 text-[15px] mb-4">{label}</h3>
      
      <div className="relative mb-4">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <IndianRupee className="w-5 h-5" />
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="40000"
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-[#ED4136] focus:border-transparent"
          autoFocus
        />
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-[14px] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0}
          className="flex-1 bg-black text-white py-3 rounded-xl font-medium text-[14px] hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
