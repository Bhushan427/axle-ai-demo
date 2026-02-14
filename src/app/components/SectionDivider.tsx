import React from 'react';

interface SectionDividerProps {
  label: string;
  icon?: React.ReactNode;
}

export function SectionDivider({ label, icon }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-2 my-4 px-1">
      <div className="flex-1 h-px bg-gray-200"></div>
      <div className="flex items-center gap-2 text-gray-500 text-[12px] font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex-1 h-px bg-gray-200"></div>
    </div>
  );
}
