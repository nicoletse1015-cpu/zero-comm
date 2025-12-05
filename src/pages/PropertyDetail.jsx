import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Heart, Share2, Flag, ChevronLeft, ChevronRight, X,
  Bed, Bath, Maximize, Building2, Compass, Calendar,
  Train, MapPin, Check, Star, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import VerificationBadge from '@/components/property/VerificationBadge';
import SaveCommissionFAB from '@/components/property/SaveCommissionFAB';
import IRISButton from '@/components/property/IRISButton';
import LegalDisclaimerModal from '@/components/modals/LegalDisclaimerModal';
import ShareModal from '@/components/modals/ShareModal';
import ReportModal from '@/components/modals/ReportModal';
import { cn } from '@/lib/utils';

export default function PropertyDetail() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [user, setUser] = useState(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => base44.entities.Property.filter({ id: propertyId }),
    select: (data) => data[0],
    enabled: !!propertyId
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => base44.entities.Favorite.filter({ user_id: String(user?.id) }),
    enabled: !!user?.id
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', propertyId],
    queryFn: () => base44.entities.Review.filter({ property_id: propertyId }),
    enabled: !!propertyId
  });

  // Fetch owner's real-time verification status
  const { data: ownerData } = useQuery({
    queryKey: ['owner', property?.owner_id],
    queryFn: () => base44.entities.User.filter({ id: property?.owner_id }),
    select: (data) => data[0],
    enabled: !!property?.owner_id
  });

  // Record property view for Premium analytics
  useEffect(() => {
    const recordView = async () => {
      if (!property || !user || user.id === property.owner_id) return;
      
      // Check if owner is premium
      if (ownerData?.is_premium && ownerData?.premium_expires_at && new Date(ownerData.premium_expires_at) > new Date()) {
        await base44.entities.PropertyView.create({
          property_id: String(property.id),
          property_owner_id: String(property.owner_id),
          viewer_id: String(user.id),
          viewer_name: user.full_name || user.email,
          viewer_email: user.email
        });
      }
    };
    recordView();
  }, [property?.id, user?.id, ownerData]);

  // Calculate owner's verification level based on verified_steps
  const getOwnerVerificationLevel = () => {
    if (!ownerData?.verified_steps) return 'grey';
    const steps = ownerData.verified_steps;
    if (steps.includes('property')) return 'rainbow';
    if (steps.includes('id')) return 'green';
    if (steps.includes('phone') || steps.includes('email')) return 'blue';
    return 'grey';
  };

  const ownerVerificationLevel = getOwnerVerificationLevel();

  const isFavorite = favorites.some(f => f.property_id === propertyId);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }
      const existing = favorites.find(f => f.property_id === propertyId);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
      } else {
        await base44.entities.Favorite.create({
                        property_id: propertyId,
                        user_id: String(user.id)
                      });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
    }
  });

  const handleContactOwner = async () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    // Check if chat room exists
    const existingRooms = await base44.entities.ChatRoom.filter({
      property_id: String(propertyId),
      tenant_id: String(user.id)
    });
    
    if (existingRooms.length > 0) {
      window.location.href = createPageUrl('Chat') + `?roomId=${existingRooms[0].id}`;
    } else {
      // Create new chat room
      const newRoom = await base44.entities.ChatRoom.create({
        property_id: String(propertyId),
        property_title: property.title,
        owner_id: String(property.owner_id),
        owner_name: property.owner_name,
        tenant_id: String(user.id),
        tenant_name: user.full_name || user.email
      });
      window.location.href = createPageUrl('Chat') + `?roomId=${newRoom.id}`;
    }
  };

  if (isLoading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const images = property.images?.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format'];

  const formatPrice = (price, type) => {
    if (price >= 10000000) {
      return `HKD ${(price / 10000000).toFixed(2)} 億`;
    } else if (price >= 10000) {
      return `HKD ${(price / 10000).toFixed(0)} 萬${type === 'rent' ? '/月' : ''}`;
    }
    return `HKD ${price.toLocaleString()}${type === 'rent' ? '/月' : ''}`;
  };

  const features = [
    property.has_rooftop && '天台',
    property.has_balcony && '露台',
    property.has_garden && '花園',
    property.has_sea_view && '海景',
    property.has_mountain_view && '山景',
    ...(property.features || [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Image Gallery */}
      <div className="relative">
        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[60vh] p-2">
          <div 
            className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden rounded-l-2xl"
            onClick={() => setShowGallery(true)}
          >
            <img
              src={images[0]}
              alt=""
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          {images.slice(1, 5).map((img, idx) => (
            <div 
              key={idx}
              className={cn(
                "relative cursor-pointer overflow-hidden",
                idx === 1 && "rounded-tr-2xl",
                idx === 3 && "rounded-br-2xl"
              )}
              onClick={() => {
                setCurrentImageIndex(idx + 1);
                setShowGallery(true);
              }}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-semibold">+{images.length - 5} 張相片</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative h-[50vh]">
          <img
            src={images[currentImageIndex]}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentImageIndex ? "bg-white w-4" : "bg-white/60"
                )}
              />
            ))}
          </div>
          {currentImageIndex > 0 && (
            <button
              onClick={() => setCurrentImageIndex(prev => prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {currentImageIndex < images.length - 1 && (
            <button
              onClick={() => setCurrentImageIndex(prev => prev + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Link 
            to={createPageUrl('Home')}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex gap-2">
            <button
                                onClick={() => toggleFavoriteMutation.mutate()}
                                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                              >
                                <Heart className={cn("w-5 h-5", isFavorite && "fill-[#FF385C] text-[#FF385C]")} />
                              </button>
                              <button 
                                onClick={() => setShowShareModal(true)}
                                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                              >
                                <Share2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => setShowReportModal(true)}
                                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                              >
                                <Flag className="w-5 h-5" />
                              </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <VerificationBadge level={ownerVerificationLevel} />
                {property.is_superhost && (
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                    ⭐ 超讚房東
                  </Badge>
                )}
                <Badge variant="outline" className="text-green-600 border-green-300">
                  業主直讓 · 零佣金
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {property.estate_name} · {property.district}
                {property.address && ` · ${property.address}`}
              </p>
              {property.rating && (
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{property.rating.toFixed(2)}</span>
                  <span className="text-gray-500">· {reviews.length} 則評論</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Bed className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">睡房</p>
                  <p className="font-semibold">{property.bedrooms} 房</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Bath className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">浴室</p>
                  <p className="font-semibold">{property.bathrooms || 1} 浴</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Maximize className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">實用面積</p>
                  <p className="font-semibold">{property.saleable_area} 呎</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Compass className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">朝向</p>
                  <p className="font-semibold">{property.facing || '—'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">物業詳情</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">物業類型</span>
                  <span className="font-medium">{property.property_type || '公寓'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">建築面積</span>
                  <span className="font-medium">{property.gross_area || '—'} 呎</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">樓層</span>
                  <span className="font-medium">{property.floor || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">樓齡</span>
                  <span className="font-medium">{property.building_age ? `${property.building_age} 年` : '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">客廳</span>
                  <span className="font-medium">{property.living_rooms || 1} 廳</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">放盤類型</span>
                  <span className="font-medium">{property.listing_type === 'rent' ? '出租' : '出售'}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4">特色設施</h2>
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1.5">
                        <Check className="w-4 h-4 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* MTR Info */}
            {property.nearest_mtr && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4">交通配套</h2>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Train className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium">最近港鐵站</p>
                      <p className="text-gray-600">
                        {property.nearest_mtr}站 · 步行 {property.mtr_walk_minutes} 分鐘
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* IRIS Button */}
            <div className="flex gap-3">
              <IRISButton address={property.address} className="flex-1" />
              <Button 
                variant="outline" 
                onClick={() => setShowLegalModal(true)}
                className="flex-1"
              >
                法律須知
              </Button>
            </div>
          </div>

          {/* Sidebar - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 border rounded-2xl shadow-lg">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(property.price, property.listing_type)}
                </p>
                <p className="text-gray-500 text-sm">
                  {property.listing_type === 'rent' ? '月租' : '售價'}
                  {' · '}${Math.round(property.price / property.saleable_area)}/呎
                </p>
              </div>

              <Separator className="my-4" />

              {/* Owner Info */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-[#FF385C] text-white">
                    {(ownerData?.full_name || property.owner_name || 'U')[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{ownerData?.full_name || property.owner_name || '業主'}</p>
                    <VerificationBadge level={ownerVerificationLevel} size="sm" />
                  </div>
                  <p className="text-sm text-gray-500">業主直讓</p>
                </div>
              </div>

              <Button 
                onClick={handleContactOwner}
                className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white py-6 text-lg rounded-xl"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                聯絡業主
              </Button>

              <p className="text-center text-sm text-gray-500 mt-3">
                即時傳訊，無需透過中介
              </p>

              {/* Commission Saved */}
              <div className="mt-4 p-4 bg-green-50 rounded-xl text-center">
                <p className="text-sm text-green-700 font-medium">
                  💰 使用直居省下約{' '}
                  <span className="font-bold">
                    HKD {property.listing_type === 'rent' 
                      ? Math.round(property.price * 0.5).toLocaleString() 
                      : Math.round(property.price * 0.01).toLocaleString()}
                  </span>
                  {' '}{property.listing_type === 'rent' ? '(半月佣金)' : '(1% 佣金)'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:hidden z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold">{formatPrice(property.price, property.listing_type)}</p>
            <p className="text-sm text-gray-500">業主直讓</p>
          </div>
          <Button 
            onClick={handleContactOwner}
            className="bg-[#FF385C] hover:bg-[#E31C5F] text-white px-8 py-6 rounded-xl"
          >
            聯絡業主
          </Button>
        </div>
      </div>

      {/* Full Screen Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 text-white">
            <span>{currentImageIndex + 1} / {images.length}</span>
            <button onClick={() => setShowGallery(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <button
              onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
              className="p-2 text-white hover:bg-white/10 rounded-full mr-4"
              disabled={currentImageIndex === 0}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <img
              src={images[currentImageIndex]}
              alt=""
              className="max-h-[80vh] max-w-full object-contain"
            />
            <button
              onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
              className="p-2 text-white hover:bg-white/10 rounded-full ml-4"
              disabled={currentImageIndex === images.length - 1}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      <SaveCommissionFAB 
        monthlyRent={property.listing_type === 'rent' ? property.price : undefined}
        salePrice={property.listing_type === 'sale' ? property.price : undefined}
        listingType={property.listing_type}
      />

      {/* Legal Disclaimer Modal */}
                  <LegalDisclaimerModal 
                    open={showLegalModal}
                    onClose={() => setShowLegalModal(false)}
                    onProceed={() => setShowLegalModal(false)}
                    type={property.listing_type === 'rent' ? 'rental' : 'sale'}
                  />

                  {/* Share Modal */}
                  <ShareModal 
                    open={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    property={property}
                  />

                  {/* Report Modal */}
                  <ReportModal 
                    open={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    propertyId={propertyId}
                  />
                </div>
              );
            }