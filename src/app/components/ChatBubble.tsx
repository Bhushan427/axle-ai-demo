import React from 'react';

interface ChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
}

export function ChatBubble({ message, isUser = false, timestamp }: ChatBubbleProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 message-animate`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-[#FF4D00] text-white rounded-br-md'
            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
        }`}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-line">{message}</p>
        {timestamp && (
          <p className={`text-[11px] mt-1 ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
