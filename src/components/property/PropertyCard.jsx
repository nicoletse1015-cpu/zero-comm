import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PropertyCard({ property, isFavorite, onToggleFavorite }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onToggleFavorite) return;
    setIsAnimating(true);
    await onToggleFavorite(String(property.id));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const images = property.images?.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format'];

  const formatPrice = (price, type) => {
    if (price >= 10000000) {
      return `$${(price / 10000000).toFixed(2)}億`;
    } else if (price >= 10000) {
      return `$${(price / 10000).toFixed(0)}萬${type === 'rent' ? '/月' : ''}`;
    }
    return `$${price.toLocaleString()}${type === 'rent' ? '/月' : ''}`;
  };

  return (
    <Link 
      to={createPageUrl('PropertyDetail') + `?id=${property.id}`}
      className="block group"
    >
      <div className="relative">
        {/* Image Container */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={images[imageIndex]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageIndex(idx);
                  }}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    idx === imageIndex 
                      ? "bg-white w-2" 
                      : "bg-white/60 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.owner_is_premium && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-xs font-medium text-white shadow-sm">
                ⭐ Premium
              </span>
            )}
            {property.is_superhost && (
              <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-800 shadow-sm">
                超讚房東
              </span>
            )}
            {property.is_hot && (
              <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-800 shadow-sm">
                熱門
              </span>
            )}
          </div>

          {/* Heart Button */}
          <button
            onClick={handleHeartClick}
            className={cn(
              "absolute top-3 right-3 p-2 transition-transform",
              isAnimating && "scale-125"
            )}
          >
            <Heart
              className={cn(
                "w-6 h-6 transition-all duration-300",
                isFavorite 
                  ? "fill-[#FF385C] stroke-[#FF385C]" 
                  : "fill-black/30 stroke-white stroke-2 hover:scale-110"
              )}
            />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3 space-y-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-[15px] text-gray-900 line-clamp-1">
              {property.estate_name || property.title}
            </h3>
            {property.rating && (
              <div className="flex items-center gap-1 text-sm">
                <span>★</span>
                <span>{property.rating.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-500 text-sm">
            {property.bedrooms}房{property.living_rooms || 1}廳 · {property.saleable_area}呎
          </p>
          
          {property.nearest_mtr && (
            <p className="text-gray-500 text-sm">
              🚇 {property.nearest_mtr}站 {property.mtr_walk_minutes}分鐘
            </p>
          )}
          
          <p className="font-semibold text-[15px] mt-1">
            {formatPrice(property.price, property.listing_type)}
            <span className="font-normal text-gray-500 text-sm ml-1">
              · 業主直讓
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}