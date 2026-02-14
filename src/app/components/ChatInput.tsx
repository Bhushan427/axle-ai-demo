import React, { useState } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  contextualHelp?: string[];
  onContextualClick?: (action: string) => void;
}

export function ChatInput({ 
  onSend, 
  placeholder = 'Type or speak...', 
  disabled,
  contextualHelp = [],
  onContextualClick 
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Contextual Help Chips */}
      {contextualHelp.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {contextualHelp.map((help, index) => (
            <button
              key={index}
              onClick={() => onContextualClick?.(help)}
              className="bg-orange-50 text-[#FF4D00] px-3 py-1.5 rounded-full text-[12px] font-medium hover:bg-orange-100 transition-colors border border-orange-200 flex items-center gap-1"
            >
              <span>→</span>
              <span>{help}</span>
            </button>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none text-[15px] text-gray-800 placeholder:text-gray-400"
          />
          <button
            onClick={() => {}}
            className="text-gray-400 hover:text-gray-600 ml-2"
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-[#FF4D00] text-white p-3 rounded-full hover:bg-[#E64500] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
