import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AirbnbSearchBar from '@/components/search/AirbnbSearchBar';
import CategoryTabs from '@/components/ui/CategoryTabs';
import HorizontalPropertySection from '@/components/property/HorizontalPropertySection';
import PremiumCarousel from '@/components/property/PremiumCarousel';
import SaveCommissionFAB from '@/components/property/SaveCommissionFAB';
import PDPOConsentModal from '@/components/modals/PDPOConsentModal';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch properties
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.filter({ status: 'active' }, '-created_date', 50)
  });

  // Fetch user favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => base44.entities.Favorite.filter({ user_id: String(user?.id) }),
    enabled: !!user?.id
  });

  const favoriteIds = favorites.map(f => f.property_id);

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (propertyId) => {
      if (!user) {
        base44.auth.redirectToLogin();
        throw new Error('Not logged in');
      }
      const existing = favorites.find(f => f.property_id === String(propertyId));
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
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  // Group properties by different criteria
      // Premium properties show first (優先曝光)
      const sortedProperties = [...properties].sort((a, b) => {
        // Premium properties first
        if (a.owner_is_premium && !b.owner_is_premium) return -1;
        if (!a.owner_is_premium && b.owner_is_premium) return 1;
        return 0;
      });

      const hotProperties = sortedProperties.filter(p => p.is_hot);
      const rentProperties = sortedProperties.filter(p => p.listing_type === 'rent');
      const saleProperties = sortedProperties.filter(p => p.listing_type === 'sale');
      const islandProperties = properties.filter(p => ['中西區', '灣仔', '東區', '南區'].includes(p.district));
      const kowloonProperties = properties.filter(p => ['油尖旺', '深水埗', '九龍城', '黃大仙', '觀塘'].includes(p.district));
      const seaViewProperties = properties.filter(p => p.has_sea_view);
      const under25kRent = properties.filter(p => p.listing_type === 'rent' && p.price <= 25000 && p.bedrooms >= 3);
      const nearMTR = properties.filter(p => p.mtr_walk_minutes && p.mtr_walk_minutes <= 5);
      const superhostProperties = properties.filter(p => p.is_superhost);

  // Calculate total savings for FAB
  const avgRent = properties.filter(p => p.listing_type === 'rent').reduce((sum, p) => sum + p.price, 0) / 
                  (properties.filter(p => p.listing_type === 'rent').length || 1);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Logo + Search */}
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF385C] to-[#E31C5F] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">直</span>
              </div>
              <span className="hidden md:block text-xl font-bold text-[#FF385C]">直居</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <AirbnbSearchBar variant="default" />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link 
                to={createPageUrl('CreateListing')}
                className="hidden lg:block text-sm font-medium text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-full cursor-pointer transition-colors"
              >
                放盤免費
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full p-2 md:px-3 md:py-2 gap-2">
                    <Menu className="w-4 h-4" />
                    <div className="hidden md:flex w-7 h-7 bg-gray-500 rounded-full items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Profile')}>我的帳戶</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Chat')}>訊息</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Profile')}>收藏</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('CreateListing')}>免費放盤</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => base44.auth.logout()}>
                        登出
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => base44.auth.redirectToLogin()}>
                        登入
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => base44.auth.redirectToLogin()}>
                        註冊
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('CreateListing')}>免費放盤</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <CategoryTabs 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {isLoading ? (
          <div className="px-6 md:px-10 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Hero Banner */}
            <div className="relative h-[300px] md:h-[400px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1600&auto=format"
                alt="Hong Kong Skyline"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-6 md:left-10 text-white">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                  業主直讓，零佣金
                </h1>
                <p className="text-lg md:text-xl opacity-90">
                  香港首個 100% P2P 房地產平台
                </p>
              </div>
            </div>

            {/* Premium Carousel - 置頂廣告位 */}
            <PremiumCarousel 
              properties={properties}
              favorites={favoriteIds}
              onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
            />

            {/* Horizontal Sections */}
            <div className="divide-y divide-gray-100">
              {hotProperties.length > 0 && (
                                    <HorizontalPropertySection
                                      title="🔥 熱門放盤"
                                      subtitle="最多人睇嘅房源"
                                      properties={hotProperties}
                                      favorites={favoriteIds}
                                      onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                                    />
                                  )}

                                  {rentProperties.length > 0 && (
                                    <HorizontalPropertySection
                                      title="🏠 出租盤"
                                      subtitle="業主直租，零佣金"
                                      properties={rentProperties}
                                      favorites={favoriteIds}
                                      onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                                    />
                                  )}

                                  {saleProperties.length > 0 && (
                                    <HorizontalPropertySection
                                      title="💰 出售盤"
                                      subtitle="業主直售，免代理費"
                                      properties={saleProperties}
                                      favorites={favoriteIds}
                                      onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                                    />
                                  )}

                                  {nearMTR.length > 0 && (
                <HorizontalPropertySection
                  title="🚇 港鐵上蓋 5 分鐘"
                  subtitle="返工超方便"
                  properties={nearMTR}
                  favorites={favoriteIds}
                  onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                />
              )}

              {islandProperties.length > 0 && (
                <HorizontalPropertySection
                  title="🏝️ 港島區精選"
                  subtitle="中西區、灣仔、東區、南區"
                  properties={islandProperties}
                  favorites={favoriteIds}
                  onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                />
              )}

              {kowloonProperties.length > 0 && (
                <HorizontalPropertySection
                  title="🌃 九龍區精選"
                  subtitle="油尖旺、深水埗、九龍城"
                  properties={kowloonProperties}
                  favorites={favoriteIds}
                  onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                />
              )}

              {seaViewProperties.length > 0 && (
                <HorizontalPropertySection
                  title="🌊 無敵海景"
                  subtitle="每日醒來都係靚景"
                  properties={seaViewProperties}
                  favorites={favoriteIds}
                  onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                />
              )}

              {under25kRent.length > 0 && (
                <HorizontalPropertySection
                  title="💰 3房 $25K 以下"
                  subtitle="CP值超高家庭選擇"
                  properties={under25kRent}
                  favorites={favoriteIds}
                  onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                />
              )}

              {superhostProperties.length > 0 && (
                <HorizontalPropertySection
                  title="⭐ 超讚房東"
                  subtitle="評分 4.8+ 的優質業主"
                  properties={superhostProperties}
                  favorites={favoriteIds}
                  onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                />
              )}

              {/* All Properties if no filtered sections */}
              {properties.length > 0 && !hotProperties.length && (
                <HorizontalPropertySection
                  title="最新放盤"
                  properties={properties}
                  favorites={favoriteIds}
                  onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                />
              )}
            </div>

            {/* Zero Commission Banner */}
            <div className="mx-6 md:mx-10 my-8 p-6 md:p-8 bg-gradient-to-r from-[#FF385C] to-[#BD1E59] rounded-3xl text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    💰 零佣金，真正省錢
                  </h2>
                  <p className="text-white/90">
                    傳統仲介收租客+業主各半個月佣金，直居幫你全數慳返！
                  </p>
                </div>
                <button className="px-6 py-3 bg-white text-[#FF385C] font-semibold rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
                  了解更多
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Save Commission FAB */}
      <SaveCommissionFAB 
        monthlyRent={avgRent || 20000}
        listingType="rent"
      />

      {/* PDPO Consent Modal */}
      <PDPOConsentModal />
    </div>
  );
}