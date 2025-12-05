import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, Eye, MessageCircle, Crown, Lock,
  Building2, Users
} from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default function PropertyViews() {
  const [user, setUser] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  // Fetch user's properties
  const { data: myProperties = [] } = useQuery({
    queryKey: ['myProperties', user?.id],
    queryFn: () => base44.entities.Property.filter({ owner_id: String(user?.id) }),
    enabled: !!user?.id
  });

  // Fetch views for user's properties
  const { data: allViews = [], isLoading } = useQuery({
    queryKey: ['propertyViews', user?.id],
    queryFn: () => base44.entities.PropertyView.filter({ property_owner_id: String(user?.id) }, '-created_date', 100),
    enabled: !!user?.id
  });

  const isPremium = user?.is_premium && user?.premium_expires_at && new Date(user.premium_expires_at) > new Date();

  // Filter views by selected property
  const filteredViews = selectedProperty === 'all' 
    ? allViews 
    : allViews.filter(v => v.property_id === selectedProperty);

  // Group views by viewer (unique viewers)
  const uniqueViewers = filteredViews.reduce((acc, view) => {
    if (!acc[view.viewer_id]) {
      acc[view.viewer_id] = {
        ...view,
        viewCount: 1,
        lastViewed: view.created_date
      };
    } else {
      acc[view.viewer_id].viewCount++;
      if (new Date(view.created_date) > new Date(acc[view.viewer_id].lastViewed)) {
        acc[view.viewer_id].lastViewed = view.created_date;
      }
    }
    return acc;
  }, {});

  const viewersList = Object.values(uniqueViewers).sort((a, b) => 
    new Date(b.lastViewed) - new Date(a.lastViewed)
  );

  const handleStartChat = async (viewerId, viewerName) => {
    if (!user || !selectedProperty || selectedProperty === 'all') return;
    
    const property = myProperties.find(p => p.id === selectedProperty);
    if (!property) return;

    // Check if chat room exists
    const existingRooms = await base44.entities.ChatRoom.filter({
      property_id: String(selectedProperty),
      tenant_id: String(viewerId)
    });
    
    if (existingRooms.length > 0) {
      window.location.href = createPageUrl('Chat') + `?roomId=${existingRooms[0].id}`;
    } else {
      // Create new chat room
      const newRoom = await base44.entities.ChatRoom.create({
        property_id: String(selectedProperty),
        property_title: property.title,
        owner_id: String(user.id),
        owner_name: user.full_name || user.email,
        tenant_id: String(viewerId),
        tenant_name: viewerName
      });
      window.location.href = createPageUrl('Chat') + `?roomId=${newRoom.id}`;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold ml-2">瀏覽數據</h1>
          <Badge className="ml-2 bg-amber-400 text-amber-900">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {!isPremium ? (
          /* Non-Premium Lock Screen */
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Premium 專屬功能</h2>
              <p className="text-gray-500 mb-6">
                升級 Premium 即可查看誰瀏覽了你的房源，<br/>並直接開啟聊天詢問意向
              </p>
              <Link to={createPageUrl('Premium')}>
                <Button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  升級 Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{allViews.length}</p>
                  <p className="text-xs text-gray-500">總瀏覽次數</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{Object.keys(uniqueViewers).length}</p>
                  <p className="text-xs text-gray-500">獨立訪客</p>
                </CardContent>
              </Card>
            </div>

            {/* Property Filter */}
            {myProperties.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">選擇房源</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-white"
                >
                  <option value="all">所有房源</option>
                  {myProperties.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Viewers List */}
            <Card>
              <CardContent className="p-0 divide-y">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF385C] mx-auto"></div>
                  </div>
                ) : viewersList.length === 0 ? (
                  <div className="p-8 text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">暫無瀏覽記錄</p>
                    <p className="text-sm text-gray-400 mt-1">當有人瀏覽你的房源時會顯示在這裡</p>
                  </div>
                ) : (
                  viewersList.map((viewer) => (
                    <div key={viewer.viewer_id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[#FF385C] text-white">
                            {(viewer.viewer_name || 'U')[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{viewer.viewer_name || '用戶'}</p>
                          <p className="text-sm text-gray-500">
                            瀏覽 {viewer.viewCount} 次 · {format(new Date(viewer.lastViewed), 'MM/dd HH:mm', { locale: zhTW })}
                          </p>
                        </div>
                      </div>
                      {selectedProperty !== 'all' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartChat(viewer.viewer_id, viewer.viewer_name)}
                          className="bg-[#FF385C] hover:bg-[#E31C5F]"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          聊天
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}