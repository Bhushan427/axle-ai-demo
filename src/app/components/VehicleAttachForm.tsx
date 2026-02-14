import React, { useState } from 'react';
import { Truck, User, Phone } from 'lucide-react';

interface VehicleAttachFormProps {
  route: { from: string; to: string };
  onSubmit: (data: { driverName: string; driverMobile: string; vehicleNumber: string }) => void;
  onCancel?: () => void;
}

export function VehicleAttachForm({ route, onSubmit, onCancel }: VehicleAttachFormProps) {
  const [formData, setFormData] = useState({
    driverName: '',
    driverMobile: '',
    vehicleNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.driverName && formData.driverMobile && formData.vehicleNumber) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 mb-3">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 text-[15px] mb-1">Attach Vehicle</h3>
        <p className="text-gray-600 text-[13px]">{route.from} → {route.to}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-[13px] font-medium mb-2">
            Driver Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              placeholder="Enter driver name"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-[13px] font-medium mb-2">
            Driver Mobile *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={formData.driverMobile}
              onChange={(e) => setFormData({ ...formData, driverMobile: e.target.value })}
              placeholder="Enter mobile number"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-[13px] font-medium mb-2">
            Vehicle Number *
          </label>
          <div className="relative">
            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
              placeholder="BR33CX7391"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-[14px] uppercase focus:outline-none focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-[14px] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-black text-white py-3 rounded-xl font-medium text-[14px] hover:bg-gray-800 transition-colors"
          >
            Attach Vehicle
          </button>
        </div>
      </form>
    </div>
  );
}
