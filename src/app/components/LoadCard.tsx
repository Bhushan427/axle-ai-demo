import React from 'react';
import { Truck, Package, Calendar, IndianRupee, MapPin } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface LoadCardProps {
  route: {
    from: string;
    to: string;
  };
  truckType: string;
  material?: string;
  capacity?: string;
  biddingEndTime?: string;
  targetPrice?: number;
  bidAmount?: number;
  status?: 'open' | 'cancelled' | 'awaiting-arrival' | 'in-transit' | 'unloaded' | 'closed';
  bidStatus?: 'placed' | 'awaiting' | 'won' | 'lost' | 'revised';
  onAction?: () => void;
  actionLabel?: string;
  loadType?: 'delhivery' | 'client' | 'marketplace';
}

export function LoadCard({
  route,
  truckType,
  material,
  capacity,
  biddingEndTime,
  targetPrice,
  bidAmount,
  status,
  bidStatus,
  onAction,
  actionLabel = 'Place Bid',
  loadType,
}: LoadCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-3">
      {/* Header with route and status */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-[15px]">
              {route.from} → {route.to}
            </h3>
          </div>
          {loadType && (
            <div className="flex gap-1">
              {loadType === 'delhivery' && (
                <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                  ⚡ Delhivery Load
                </span>
              )}
              {loadType === 'client' && (
                <span className="text-[11px] bg-[#ED4136]/10 text-[#ED4136] px-2 py-0.5 rounded">
                  👤 Client Load
                </span>
              )}
              {loadType === 'marketplace' && (
                <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  🏪 Marketplace
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {status && <StatusBadge status={status} label={status.replace('-', ' ')} />}
          {bidStatus && <StatusBadge status={bidStatus} label={bidStatus} />}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-gray-700 text-[13px]">
          <Truck className="w-4 h-4 text-gray-400" />
          <span>{truckType}</span>
          {capacity && <span className="text-gray-500">• {capacity}</span>}
        </div>

        {material && (
          <div className="flex items-center gap-2 text-gray-700 text-[13px]">
            <Package className="w-4 h-4 text-gray-400" />
            <span>{material}</span>
          </div>
        )}

        {biddingEndTime && (
          <div className="flex items-center gap-2 text-red-600 text-[13px]">
            <Calendar className="w-4 h-4" />
            <span>Closes in {biddingEndTime}</span>
          </div>
        )}

        {(targetPrice || bidAmount) && (
          <div className="flex items-center gap-3 mt-2">
            {targetPrice && (
              <div className="flex items-center gap-1 text-gray-700 text-[13px]">
                <IndianRupee className="w-4 h-4 text-gray-400" />
                <span className="font-medium">₹{targetPrice.toLocaleString('en-IN')}</span>
                <span className="text-gray-500 text-[11px]">Target</span>
              </div>
            )}
            {bidAmount && (
              <div className="flex items-center gap-1 text-green-700 text-[13px]">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span className="font-bold">₹{bidAmount.toLocaleString('en-IN')}</span>
                <span className="text-gray-500 text-[11px]">Your bid</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action button */}
      {onAction && (
        <button
          onClick={onAction}
          className="w-full bg-black text-white py-3 rounded-xl font-medium text-[14px] hover:bg-gray-800 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
