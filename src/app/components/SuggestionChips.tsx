import React from 'react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSuggestionClick }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-[13px] font-medium hover:bg-gray-200 transition-colors border border-gray-200"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
