import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { cn } from '@/lib/utils';

export default function HorizontalPropertySection({ 
  title, 
  subtitle,
  properties, 
  favorites = [],
  onToggleFavorite,
  showViewAll = true 
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!properties?.length) return null;

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 md:px-10">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Scroll Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-300 hover:border-gray-400 hover:shadow-md transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-300 hover:border-gray-400 hover:shadow-md transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {showViewAll && (
            <button className="text-sm font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-600 ml-4">
              顯示全部
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-6 md:px-10 pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {properties.map((property) => (
          <div 
            key={property.id} 
            className="flex-shrink-0 w-[280px] md:w-[300px] snap-start"
          >
            <PropertyCard
              property={property}
              isFavorite={favorites.includes(property.id)}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </section>
  );
}