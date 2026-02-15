import React from 'react';
import { Lightbulb } from 'lucide-react';

export function DemoInstructions() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-3">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-blue-900 text-[14px] mb-2">Demo Instructions</h4>
          <p className="text-blue-800 text-[13px] leading-relaxed mb-2">
            Try these sample credentials:
          </p>
          <div className="bg-white/60 rounded-lg p-2 text-[12px] space-y-1 font-mono">
            <p className="text-blue-900"><strong>Mobile:</strong> 7718896629</p>
            <p className="text-blue-900"><strong>OTP:</strong> 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
