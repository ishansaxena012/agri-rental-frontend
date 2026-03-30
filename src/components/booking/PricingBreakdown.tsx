import { formatCurrency, calculatePricing } from "@/lib/utils";

interface PricingBreakdownProps {
  pricePerDay: number;
  totalDays: number;
}

export default function PricingBreakdown({ pricePerDay, totalDays }: PricingBreakdownProps) {
  const { subtotal, platformFee, total } = calculatePricing(pricePerDay, totalDays);

  return (
    <div className="bg-earth-50 rounded-2xl p-4 space-y-2">
      <div className="flex justify-between text-sm text-earth-600">
        <span>{formatCurrency(pricePerDay)} × {totalDays} day{totalDays !== 1 ? "s" : ""}</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-earth-600">
        <span>Platform fee (5%)</span>
        <span>{formatCurrency(platformFee)}</span>
      </div>
      <div className="border-t border-earth-200 pt-2 flex justify-between font-semibold text-bark">
        <span>Total</span>
        <span className="text-sage-600 font-display text-lg">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
