import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, Home, Building2, Star, MessageCircle, 
  Calendar, DollarSign, MapPin
} from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionHistory() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  // Fetch properties I own that are rented/sold
  const { data: myListings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['myCompletedListings', user?.id],
    queryFn: () => base44.entities.Property.filter({ owner_id: String(user?.id) }),
    enabled: !!user?.id
  });

  // Fetch chat rooms where I'm tenant (rented/bought from others)
  const { data: chatRooms = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['myChatRooms', user?.id],
    queryFn: async () => {
      const rooms = await base44.entities.ChatRoom.filter({ tenant_id: String(user?.id) });
      return rooms;
    },
    enabled: !!user?.id
  });

  // Fetch properties from chat rooms
  const { data: rentedBoughtProperties = [] } = useQuery({
    queryKey: ['rentedBoughtProperties', chatRooms],
    queryFn: async () => {
      const propertyIds = [...new Set(chatRooms.map(r => r.property_id))];
      const properties = await Promise.all(
        propertyIds.map(id => base44.entities.Property.filter({ id }))
      );
      return properties.flat().filter(p => p.status === 'rented' || p.status === 'sold');
    },
    enabled: chatRooms.length > 0
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  // My listings that are rented out / sold
  const myRentedOut = myListings.filter(p => p.status === 'rented');
  const mySoldOut = myListings.filter(p => p.status === 'sold');

  // Properties I rented / bought
  const iRented = rentedBoughtProperties.filter(p => p.listing_type === 'rent');
  const iBought = rentedBoughtProperties.filter(p => p.listing_type === 'sale');

  const isLoading = listingsLoading || chatsLoading;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">歷史記錄</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="landlord">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="landlord" className="flex-1">租出/售出</TabsTrigger>
            <TabsTrigger value="tenant" className="flex-1">租過/買過</TabsTrigger>
          </TabsList>

          <TabsContent value="landlord">
            {isLoading ? (
              <LoadingState />
            ) : (myRentedOut.length + mySoldOut.length) === 0 ? (
              <EmptyState 
                title="暫無租出/售出記錄" 
                desc="當你的放盤完成交易並標示為已租出/已售出後，記錄會顯示在這裡"
              />
            ) : (
              <div className="space-y-4">
                {myRentedOut.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">已租出 ({myRentedOut.length})</h3>
                    <div className="space-y-3">
                      {myRentedOut.map(property => (
                        <TransactionCard 
                          key={property.id} 
                          property={property} 
                          role="landlord"
                          type="rent"
                          userId={user.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {mySoldOut.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">已售出 ({mySoldOut.length})</h3>
                    <div className="space-y-3">
                      {mySoldOut.map(property => (
                        <TransactionCard 
                          key={property.id} 
                          property={property} 
                          role="seller"
                          type="sale"
                          userId={user.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tenant">
            {isLoading ? (
              <LoadingState />
            ) : (iRented.length + iBought.length) === 0 ? (
              <EmptyState 
                title="暫無租過/買過記錄" 
                desc="當你租住或購買的物業完成交易後，記錄會顯示在這裡"
              />
            ) : (
              <div className="space-y-4">
                {iRented.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">已租住 ({iRented.length})</h3>
                    <div className="space-y-3">
                      {iRented.map(property => (
                        <TransactionCard 
                          key={property.id} 
                          property={property} 
                          role="tenant"
                          type="rent"
                          userId={user.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {iBought.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">已購買 ({iBought.length})</h3>
                    <div className="space-y-3">
                      {iBought.map(property => (
                        <TransactionCard 
                          key={property.id} 
                          property={property} 
                          role="buyer"
                          type="sale"
                          userId={user.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">交易記錄須知</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 記錄會在雙方互傳意向書後，業主標示為已租出/已售出時自動生成</li>
              <li>• 你可以對完成的交易進行評價</li>
              <li>• 所有記錄僅供參考，正式合約請保留紙本</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function TransactionCard({ property, role, type, userId }) {
  const roleLabels = {
    landlord: '業主',
    seller: '賣家',
    tenant: '租客',
    buyer: '買家'
  };

  const statusLabels = {
    rented: '已租出',
    sold: '已售出'
  };

  const formatPrice = (price, listingType) => {
    if (listingType === 'rent') {
      return `HKD $${price?.toLocaleString()}/月`;
    }
    if (price >= 10000000) {
      return `HKD $${(price / 10000000).toFixed(2)}億`;
    }
    if (price >= 10000) {
      return `HKD $${(price / 10000).toFixed(0)}萬`;
    }
    return `HKD $${price?.toLocaleString()}`;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Property Image */}
          <div className="w-28 h-28 flex-shrink-0">
            <img 
              src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Info */}
          <div className="flex-1 p-3">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-medium text-sm line-clamp-1">{property.title}</h3>
              <Badge 
                className={type === 'rent' ? 'bg-blue-500' : 'bg-purple-500'}
              >
                {statusLabels[property.status]}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{property.district} · {property.estate_name || property.address}</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="font-medium">{formatPrice(property.price, property.listing_type)}</span>
              </div>
            </div>
            
            {/* Transaction Date & Time */}
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Calendar className="w-3 h-3" />
              <span>
                交易日期：{property.updated_date ? format(new Date(property.updated_date), 'yyyy年MM月dd日 HH:mm') : '—'}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <Badge variant="outline" className="text-xs">{roleLabels[role]}</Badge>
              <div className="flex gap-2">
                <Link to={createPageUrl('PropertyDetail') + `?id=${property.id}`}>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    查看詳情
                  </Button>
                </Link>
                <Link to={createPageUrl('WriteReview') + `?propertyId=${property.id}`}>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    評價
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex gap-3 animate-pulse">
              <div className="w-24 h-24 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ title, desc }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-4">{desc}</p>
        <Link to={createPageUrl('Search')}>
          <Button variant="outline">
            <Home className="w-4 h-4 mr-2" />
            瀏覽房源
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}