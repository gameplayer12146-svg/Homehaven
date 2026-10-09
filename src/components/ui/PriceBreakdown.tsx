import React from 'react';
import { formatCurrency } from '../../utils/helpers.js';
import { ShieldCheck, Info } from 'lucide-react';

interface PriceBreakdownProps {
  visitFee: number;
  estimate: number;
  tax: number;
  total: number;
  serviceName?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  visitFee,
  estimate,
  tax,
  total,
  serviceName
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div>
          <h4 className="font-semibold text-stone-900 text-sm">Transparent Price Breakdown</h4>
          {serviceName && <p className="text-xs text-stone-500 mt-0.5">{serviceName}</p>}
        </div>
        <span className="text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-medium">Guaranteed Rate</span>
      </div>

      <div className="space-y-2.5 text-xs text-stone-600">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            Technician Visit & Inspection Fee
            <span title="Covers doorstep visit, safety check & tool deployment">
              <Info className="w-3.5 h-3.5 text-stone-400" />
            </span>
          </span>
          <span className="font-mono tabular-nums text-stone-900 font-medium">
            {formatCurrency(visitFee)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>Standard Labor & Service Estimate</span>
          <span className="font-mono tabular-nums text-stone-900 font-medium">
            {formatCurrency(estimate)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>Goods & Services Tax (GST 18%)</span>
          <span className="font-mono tabular-nums text-stone-900 font-medium">
            {formatCurrency(tax)}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold text-stone-900 uppercase tracking-wide">Total Payable</span>
          <p className="text-[11px] text-stone-400">Pay only upon service completion via UPI or Cash</p>
        </div>
        <span className="text-xl font-bold font-serif-display text-[#0F4C5C] font-mono tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="flex items-start gap-2 pt-1 text-[11px] text-stone-500 bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
        <ShieldCheck className="w-4 h-4 text-[#0F4C5C] shrink-0 mt-0.5" />
        <span>
          <strong>HomeHaven Transparent Guarantee:</strong> No arbitrary doorstep surge. If spare parts are required, your technician will provide a rate-card quote before proceeding.
        </span>
      </div>
    </div>
  );
};
