import React from 'react';
import { Truck, MessageSquare, Sparkles } from 'lucide-react';

export function WelcomeCard() {
  return (
    <div className="bg-gradient-to-br from-[#FF4D00] to-[#E64500] rounded-2xl p-6 mb-4 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-6 h-6" />
        <h2 className="font-bold text-[18px]">Welcome to Axle AI</h2>
      </div>
      <p className="text-white/90 text-[14px] mb-4 leading-relaxed">
        Your intelligent assistant for managing fleet loads. I can help you search loads, place bids, track deliveries, and manage your vehicles - all through simple conversation.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <Truck className="w-5 h-5 mb-1" />
          <p className="text-[12px] font-medium">Manage Loads</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <MessageSquare className="w-5 h-5 mb-1" />
          <p className="text-[12px] font-medium">Simple Chat</p>
        </div>
      </div>
    </div>
  );
}
