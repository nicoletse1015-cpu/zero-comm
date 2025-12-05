import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MarkAsCompletedBanner({ 
  listingType, 
  onMarkCompleted, 
  isLoading 
}) {
  const isRent = listingType === 'rent';
  
  return (
    <div className={cn(
      "mx-4 my-3 p-4 rounded-xl border-2",
      isRent ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          isRent ? "bg-blue-100" : "bg-green-100"
        )}>
          {isRent ? (
            <Home className={cn("w-5 h-5", isRent ? "text-blue-600" : "text-green-600")} />
          ) : (
            <DollarSign className="w-5 h-5 text-green-600" />
          )}
        </div>
        <div className="flex-1">
          <h4 className={cn(
            "font-semibold mb-1",
            isRent ? "text-blue-800" : "text-green-800"
          )}>
            🎉 恭喜！雙方已傳送意向書
          </h4>
          <p className={cn(
            "text-sm mb-3",
            isRent ? "text-blue-700" : "text-green-700"
          )}>
            {isRent 
              ? "完成租約後，請標示此樓盤為「已租出」" 
              : "完成交易後，請標示此樓盤為「已售出」"
            }
          </p>
          <Button
            onClick={onMarkCompleted}
            disabled={isLoading}
            className={cn(
              "gap-2",
              isRent 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-green-600 hover:bg-green-700"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isLoading ? '處理中...' : (isRent ? '標示為已租出' : '標示為已售出')}
          </Button>
        </div>
      </div>
    </div>
  );
}