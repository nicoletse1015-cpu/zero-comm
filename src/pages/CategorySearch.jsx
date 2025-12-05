import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PropertyCard from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const CATEGORY_CONFIG = {
  'apartment': { title: '公寓', filter: { property_type: '公寓' } },
  'house': { title: '獨立屋', filter: { property_type: '獨立屋' } },
  'village': { title: '村屋', filter: { property_type: '村屋' } },
  'tong_lau': { title: '唐樓', filter: { property_type: '唐樓' } },
  'sea_view': { title: '海景', filter: { has_sea_view: true } },
  'mountain': { title: '山景', filter: { has_mountain_view: true } },
  'luxury': { title: '豪宅', priceMin: 50000 }
};

export default function CategorySearch() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category') || 'apartment';
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['apartment'];

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allProperties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.filter({ status: 'active' }, '-created_date', 100)
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => base44.entities.Favorite.filter({ user_id: String(user?.id) }),
    enabled: !!user?.id
  });

  const favoriteIds = favorites.map(f => f.property_id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (propertyId) => {
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }
      const existing = favorites.find(f => f.property_id === propertyId);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
      } else {
        await base44.entities.Favorite.create({
          property_id: String(propertyId),
          user_id: String(user.id)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
    }
  });

  // Filter properties based on category
  const filteredProperties = allProperties.filter(property => {
    if (config.filter) {
      for (const [key, value] of Object.entries(config.filter)) {
        if (property[key] !== value) return false;
      }
    }
    if (config.priceMin && property.price < config.priceMin) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center gap-4 px-4 py-4">
          <Link to={createPageUrl('Home')} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">{config.title}</h1>
        </div>
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-gray-200" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">暫無此類型房源</p>
            <Link to={createPageUrl('Search')}>
              <Button variant="outline" className="mt-4">瀏覽全部房源</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favoriteIds.includes(property.id)}
                onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}