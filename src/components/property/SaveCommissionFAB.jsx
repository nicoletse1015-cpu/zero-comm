import React, { useState, useEffect } from 'react';
import { Banknote, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SaveCommissionFAB({ 
  monthlyRent, 
  salePrice,
  listingType = 'rent',
  className 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);

  useEffect(() => {
    // Calculate commission saved per user
    // Rent: typically 0.5 month from each party (tenant or landlord)
    // Sale: typically 1% from each party (buyer or seller)
    if (listingType === 'rent' && monthlyRent) {
      // Save half month rent (user's portion only)
      setSavedAmount(monthlyRent * 0.5);
    } else if (listingType === 'sale' && salePrice) {
      // Save 1% (user's portion only)
      setSavedAmount(salePrice * 0.01);
    }
  }, [monthlyRent, salePrice, listingType]);

  const formatAmount = (amount) => {
    if (amount >= 10000) {
      return `HKD ${(amount / 10000).toFixed(1)}萬`;
    }
    return `HKD ${amount.toLocaleString()}`;
  };

  if (!savedAmount) return null;

  return (
    <div className={cn("fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40", className)}>
      <div
        className={cn(
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg transition-all duration-300 cursor-pointer",
          isExpanded ? "px-5 py-3" : "p-4"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <Banknote className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-xs opacity-90">直居幫你省下</p>
              <p className="text-lg font-bold">{formatAmount(savedAmount)}</p>
              <p className="text-xs opacity-75">
                {listingType === 'rent' ? '免付半月佣金' : '免付 1% 佣金'}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="ml-2 p-1 hover:bg-white/20 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            <span className="font-bold text-sm whitespace-nowrap">
              省 {formatAmount(savedAmount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}