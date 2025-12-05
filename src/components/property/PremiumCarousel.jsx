import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PremiumCarousel({ properties, favorites = [], onToggleFavorite }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter only premium properties
  const premiumProperties = properties.filter(p => p.owner_is_premium);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (premiumProperties.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % premiumProperties.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [premiumProperties.length]);

  if (premiumProperties.length === 0) return null;

  const currentProperty = premiumProperties[currentIndex];

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex(prev => prev === 0 ? premiumProperties.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % premiumProperties.length);
  };

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onToggleFavorite) return;
    setIsAnimating(true);
    await onToggleFavorite(String(currentProperty.id));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const formatPrice = (price, type) => {
    if (price >= 10000000) {
      return `$${(price / 10000000).toFixed(2)}億`;
    } else if (price >= 10000) {
      return `$${(price / 10000).toFixed(0)}萬${type === 'rent' ? '/月' : ''}`;
    }
    return `$${price.toLocaleString()}${type === 'rent' ? '/月' : ''}`;
  };

  const isFavorite = favorites.includes(currentProperty.id);

  return (
    <section className="relative mx-6 md:mx-10 my-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg">
          <Crown className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold">Premium 精選</h2>
        <span className="text-sm text-gray-500">· 置頂推薦</span>
      </div>

      {/* Carousel */}
      <Link 
        to={createPageUrl('PropertyDetail') + `?id=${currentProperty.id}`}
        className="block relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden group"
      >
        {/* Background Image */}
        <img
          src={currentProperty.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format'}
          alt={currentProperty.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Premium Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-sm font-medium text-white shadow-lg flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" />
            Premium
          </span>
        </div>

        {/* Heart Button */}
        <button
          onClick={handleHeartClick}
          className={cn(
            "absolute top-4 right-4 p-2 transition-transform",
            isAnimating && "scale-125"
          )}
        >
          <Heart
            className={cn(
              "w-7 h-7 transition-all duration-300",
              isFavorite 
                ? "fill-[#FF385C] stroke-[#FF385C]" 
                : "fill-black/30 stroke-white stroke-2 hover:scale-110"
            )}
          />
        </button>

        {/* Navigation Arrows */}
        {premiumProperties.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-1">
                {currentProperty.title}
              </h3>
              <p className="text-white/90 text-sm md:text-base">
                {currentProperty.estate_name} · {currentProperty.district}
                {' · '}{currentProperty.bedrooms}房{currentProperty.living_rooms || 1}廳
                {' · '}{currentProperty.saleable_area}呎
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-bold">
                {formatPrice(currentProperty.price, currentProperty.listing_type)}
              </p>
              <p className="text-white/80 text-sm">
                業主直讓 · 零佣金
              </p>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        {premiumProperties.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
            {premiumProperties.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToSlide(idx); }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentIndex 
                    ? "bg-white w-6" 
                    : "bg-white/50 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        )}
      </Link>
    </section>
  );
}