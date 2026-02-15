import React from 'react';
import { Info } from 'lucide-react';

interface InfoCardProps {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'tip';
}

export function InfoCard({ title, message, type = 'info' }: InfoCardProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-[#ED4136]/10 border-[#ED4136]/40 text-[#ED4136]',
    tip: 'bg-green-50 border-green-200 text-green-800',
  };

  return (
    <div className={`rounded-2xl border p-4 mb-3 ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-[14px] mb-1">{title}</h4>
          <p className="text-[13px] leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
