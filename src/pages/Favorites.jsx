import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PropertyCard from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Heart, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Favorites() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  // Fetch favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => base44.entities.Favorite.filter({ user_id: String(user?.id) }),
    enabled: !!user?.id
  });

  // Fetch favorite properties
  const { data: favoriteProperties = [], isLoading } = useQuery({
    queryKey: ['favoriteProperties', favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      const properties = await Promise.all(
        favorites.map(f => base44.entities.Property.filter({ id: f.property_id }))
      );
      return properties.flat().filter(Boolean);
    },
    enabled: favorites.length > 0
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (propertyId) => {
      const existing = favorites.find(f => f.property_id === propertyId);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      queryClient.invalidateQueries(['favoriteProperties']);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold text-lg">我的收藏</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <Skeleton className="aspect-[4/3] rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : favoriteProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">暫無收藏</h2>
            <p className="text-gray-500 mb-6">你還沒有收藏任何房源</p>
            <Link to={createPageUrl('Search')}>
              <Button className="bg-[#FF385C] hover:bg-[#E31C5F]">
                <Search className="w-4 h-4 mr-2" />
                探索房源
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={true}
                onToggleFavorite={(id) => removeFavoriteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}