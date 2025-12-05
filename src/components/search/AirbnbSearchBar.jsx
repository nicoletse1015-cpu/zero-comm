import React, { useState } from 'react';
import { Search, MapPin, Calendar, DollarSign, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AirbnbSearchBar({ 
  onSearch, 
  className,
  variant = 'default' // 'default' | 'compact' | 'hero'
}) {
  const [activeField, setActiveField] = useState(null);
  const [searchParams, setSearchParams] = useState({
    location: '',
    moveInDate: '',
    budget: '',
    rooms: ''
  });

  const fields = [
    { 
      key: 'location', 
      label: '地點', 
      placeholder: '搜尋地區或屋苑',
      icon: MapPin,
      width: 'flex-[1.5]'
    },
    { 
      key: 'moveInDate', 
      label: '租期', 
      placeholder: '隨時入住',
      icon: Calendar,
      width: 'flex-1'
    },
    { 
      key: 'budget', 
      label: '預算', 
      placeholder: '任何價格',
      icon: DollarSign,
      width: 'flex-1'
    },
    { 
      key: 'rooms', 
      label: '房間', 
      placeholder: '任何房型',
      icon: Home,
      width: 'flex-1'
    }
  ];

  const isHero = variant === 'hero';
  const isCompact = variant === 'compact';

  return (
    <Link to={createPageUrl('Search')} className="block">
      <div
        className={cn(
          "bg-white rounded-full border shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          isHero && "shadow-lg hover:shadow-xl border-gray-200",
          isCompact && "max-w-md",
          className
        )}
      >
        <div className={cn(
          "flex items-center",
          isCompact ? "p-2 gap-2" : "p-2 md:p-2"
        )}>
          {/* Mobile Compact View */}
          <div className="flex md:hidden items-center flex-1 px-4 py-2 gap-3">
            <Search className="w-5 h-5 text-gray-700" />
            <div>
              <p className="font-medium text-sm text-gray-900">搜尋房源</p>
              <p className="text-xs text-gray-500">地點 · 租期 · 預算</p>
            </div>
          </div>

          {/* Desktop Full View */}
          <div className="hidden md:flex items-center flex-1 divide-x divide-gray-200">
            {fields.map((field) => (
              <div
                key={field.key}
                className={cn(
                  "px-4 py-2 hover:bg-gray-50 rounded-full transition-colors",
                  field.width,
                  activeField === field.key && "bg-gray-50"
                )}
                onMouseEnter={() => setActiveField(field.key)}
                onMouseLeave={() => setActiveField(null)}
              >
                <p className="text-xs font-semibold text-gray-900">{field.label}</p>
                <p className="text-sm text-gray-500 truncate">{field.placeholder}</p>
              </div>
            ))}
          </div>

          {/* Search Button */}
          <button
            className={cn(
              "bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-full transition-all flex items-center justify-center gap-2",
              isCompact ? "p-2.5" : "p-3 md:px-4"
            )}
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-semibold">搜尋</span>
          </button>
        </div>
      </div>
    </Link>
  );
}