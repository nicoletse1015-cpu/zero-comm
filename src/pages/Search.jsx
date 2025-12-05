import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyMap from '@/components/map/PropertyMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Search, MapPin, X, ChevronLeft, SlidersHorizontal, 
  Map as MapIcon, List, Home, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DISTRICTS = [
  { id: 'hk', name: '港島', areas: ['中西區', '灣仔', '東區', '南區'] },
  { id: 'kln', name: '九龍', areas: ['油尖旺', '深水埗', '九龍城', '黃大仙', '觀塘'] },
  { id: 'nt', name: '新界', areas: ['葵青', '荃灣', '屯門', '元朗', '北區', '大埔', '沙田', '西貢', '離島'] }
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [bedrooms, setBedrooms] = useState(null);
  const [listingType, setListingType] = useState('rent');
  const [viewMode, setViewMode] = useState('list');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

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

  // Sort properties: Premium first (優先曝光)
  const sortedProperties = [...allProperties].sort((a, b) => {
    if (a.owner_is_premium && !b.owner_is_premium) return -1;
    if (!a.owner_is_premium && b.owner_is_premium) return 1;
    return 0;
  });

  // Filter properties
  const filteredProperties = sortedProperties.filter(property => {
    // Listing type
    if (property.listing_type !== listingType) return false;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchable = `${property.title} ${property.estate_name} ${property.district} ${property.address}`.toLowerCase();
      if (!searchable.includes(query)) return false;
    }
    
    // Districts
    if (selectedDistricts.length > 0 && !selectedDistricts.includes(property.district)) {
      return false;
    }
    
    // Price range
    if (property.price < priceRange[0] || property.price > priceRange[1]) {
      return false;
    }
    
    // Bedrooms
    if (bedrooms !== null && property.bedrooms !== bedrooms) {
      return false;
    }
    
    return true;
  });

  const toggleDistrict = (district) => {
    setSelectedDistricts(prev => 
      prev.includes(district) 
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDistricts([]);
    setPriceRange([0, 50000]);
    setBedrooms(null);
  };

  const activeFiltersCount = [
    selectedDistricts.length > 0,
    priceRange[0] > 0 || priceRange[1] < 50000,
    bedrooms !== null
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link to={createPageUrl('Home')} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋地區、屋苑名稱..."
              className="pl-10 pr-10 py-5 rounded-full border-gray-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filters Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-full gap-2 relative">
                <SlidersHorizontal className="w-4 h-4" />
                篩選
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF385C] text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
              <SheetHeader>
                <SheetTitle className="text-xl">篩選條件</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-8 overflow-y-auto pb-24">
                {/* Listing Type */}
                <div>
                  <h3 className="font-semibold mb-3">放盤類型</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setListingType('rent')}
                      className={cn(
                        "flex-1 py-3 rounded-xl border-2 font-medium transition-all",
                        listingType === 'rent' 
                          ? "border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      出租
                    </button>
                    <button
                      onClick={() => setListingType('sale')}
                      className={cn(
                        "flex-1 py-3 rounded-xl border-2 font-medium transition-all",
                        listingType === 'sale' 
                          ? "border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      出售
                    </button>
                  </div>
                </div>

                {/* Districts */}
                <div>
                  <h3 className="font-semibold mb-3">地區</h3>
                  {DISTRICTS.map(region => (
                    <div key={region.id} className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">{region.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {region.areas.map(area => (
                          <button
                            key={area}
                            onClick={() => toggleDistrict(area)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm border transition-all",
                              selectedDistricts.includes(area)
                                ? "bg-gray-900 text-white border-gray-900"
                                : "border-gray-300 hover:border-gray-400"
                            )}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">
                    預算 ({listingType === 'rent' ? '月租' : '售價'})
                  </h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={listingType === 'rent' ? 100000 : 50000000}
                    step={listingType === 'rent' ? 1000 : 100000}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}{listingType === 'rent' && '/月'}</span>
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <h3 className="font-semibold mb-3">房間數目</h3>
                  <div className="flex gap-2">
                    {[null, 1, 2, 3, 4].map(num => (
                      <button
                        key={num ?? 'any'}
                        onClick={() => setBedrooms(num)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl border-2 font-medium transition-all",
                          bedrooms === num
                            ? "border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {num === null ? '任意' : num === 4 ? '4+' : num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-3">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  清除全部
                </Button>
                <SheetTrigger asChild>
                  <Button className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F]">
                    顯示 {filteredProperties.length} 個結果
                  </Button>
                </SheetTrigger>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {(selectedDistricts.length > 0 || bedrooms !== null) && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
            {selectedDistricts.map(district => (
              <Badge 
                key={district}
                variant="secondary"
                className="rounded-full pl-3 pr-2 py-1 cursor-pointer hover:bg-gray-200"
                onClick={() => toggleDistrict(district)}
              >
                {district}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {bedrooms !== null && (
              <Badge 
                variant="secondary"
                className="rounded-full pl-3 pr-2 py-1 cursor-pointer hover:bg-gray-200"
                onClick={() => setBedrooms(null)}
              >
                {bedrooms}房
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
        )}

        {/* View Toggle */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            找到 <span className="font-semibold">{filteredProperties.length}</span> 個房源
          </p>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'list' ? "bg-white shadow-sm" : "hover:bg-gray-200"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'map' ? "bg-white shadow-sm" : "hover:bg-gray-200"
              )}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-gray-200" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              未找到符合條件的房源
            </h3>
            <p className="text-gray-500 mb-4">
              請嘗試調整篩選條件或搜尋其他地區
            </p>
            <Button variant="outline" onClick={clearFilters}>
              清除所有篩選
            </Button>
          </div>
        ) : viewMode === 'list' ? (
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
        ) : (
          <PropertyMap 
            properties={filteredProperties} 
            className="h-[60vh] rounded-2xl overflow-hidden"
          />
        )}
      </main>
    </div>
  );
}