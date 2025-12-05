import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, ChevronRight, Building2, Home, Landmark, TreePine, Waves, Mountain, Building, Castle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: '全部', icon: Building2, href: null },
  { id: 'apartment', label: '公寓', icon: Building, href: 'CategorySearch?category=apartment' },
  { id: 'house', label: '獨立屋', icon: Home, href: 'CategorySearch?category=house' },
  { id: 'village', label: '村屋', icon: TreePine, href: 'CategorySearch?category=village' },
  { id: 'tong_lau', label: '唐樓', icon: Landmark, href: 'CategorySearch?category=tong_lau' },
  { id: 'sea_view', label: '海景', icon: Waves, href: 'CategorySearch?category=sea_view' },
  { id: 'mountain', label: '山景', icon: Mountain, href: 'CategorySearch?category=mountain' },
  { id: 'luxury', label: '豪宅', icon: Castle, href: 'CategorySearch?category=luxury' },
];

export default function CategoryTabs({ activeCategory, onCategoryChange }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative border-b border-gray-200 bg-white">
      <div className="flex items-center px-6 md:px-10">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex p-2 rounded-full border border-gray-200 hover:shadow-md transition-all mr-3 bg-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Categories */}
        <div
          ref={scrollRef}
          className="flex-1 flex gap-8 overflow-x-auto scrollbar-hide py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            if (category.href) {
              return (
                <Link
                  key={category.id}
                  to={createPageUrl(category.href.split('?')[0]) + (category.href.includes('?') ? '?' + category.href.split('?')[1] : '')}
                  className={cn(
                    "flex flex-col items-center gap-2 min-w-fit pb-3 border-b-2 transition-all",
                    "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium whitespace-nowrap">{category.label}</span>
                </Link>
              );
            }
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex flex-col items-center gap-2 min-w-fit pb-3 border-b-2 transition-all",
                  isActive 
                    ? "border-gray-900 text-gray-900" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "text-gray-900")} />
                <span className="text-xs font-medium whitespace-nowrap">{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex p-2 rounded-full border border-gray-200 hover:shadow-md transition-all ml-3 bg-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}