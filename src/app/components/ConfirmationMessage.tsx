import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ConfirmationMessageProps {
  message: string;
  type?: 'success' | 'error';
  subtext?: string;
}

export function ConfirmationMessage({ message, type = 'success', subtext }: ConfirmationMessageProps) {
  return (
    <div
      className={`rounded-2xl shadow-sm border p-4 mb-3 ${
        type === 'success'
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        )}
        <div>
          <p className={`font-medium text-[14px] ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message}
          </p>
          {subtext && (
            <p className={`text-[13px] mt-1 ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
