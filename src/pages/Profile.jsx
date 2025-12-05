import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PropertyCard from '@/components/property/PropertyCard';
import VerificationBadge from '@/components/property/VerificationBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Heart, Home, Plus, Settings, LogOut, ChevronRight,
  Shield, MessageCircle, HelpCircle, FileText, Bell,
  User, Building2, Star, Award, Crown, Trash2, AlertTriangle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isBanned, setIsBanned] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.is_banned) {
        setIsBanned(true);
      } else {
        setUser(u);
      }
    }).catch(() => {
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
  const { data: favoriteProperties = [], isLoading: favLoading } = useQuery({
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

  // Fetch user's listings
  const { data: myListings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['myListings', user?.id],
    queryFn: () => base44.entities.Property.filter({ owner_id: String(user?.id) }),
    enabled: !!user?.id
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

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Welcome'));
  };



  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '確認刪除') {
      toast.error('請輸入「確認刪除」以繼續');
      return;
    }

    setIsDeleting(true);
    try {
      // Call backend to delete all user data
      await base44.functions.invoke('firebaseAuth', {
        action: 'deleteAccount'
      });

      toast.success('帳戶已永久刪除');
      base44.auth.logout(createPageUrl('Home'));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('刪除失敗，請重試');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isBanned) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">帳戶已被停用</h1>
          <p className="text-gray-500 mb-6">你的帳戶因違反使用條款已被管理員停用。如有疑問，請聯絡客服。</p>
          <Button
            onClick={() => base44.auth.logout(createPageUrl('Welcome'))}
            className="w-full bg-gray-900 hover:bg-gray-800"
          >
            登出
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const isPremium = user.is_premium && new Date(user.premium_expires_at) > new Date();
  const isAdmin = user.role === 'admin';
  const verifiedSteps = user.verified_steps || [];
  const isVerified = verifiedSteps.length >= 2;

  const menuItems = [
    { icon: Crown, label: 'Premium 會員', href: createPageUrl('Premium'), badge: isPremium ? 'PRO' : '升級', premium: true },
    { icon: User, label: '個人資料', href: createPageUrl('PersonalInfo') },
    { icon: Shield, label: '驗證中心', href: createPageUrl('Verification'), badge: isVerified ? '已驗證' : '未驗證', verified: isVerified },
    { icon: Bell, label: '通知設定', href: createPageUrl('Notifications') },
    { icon: MessageCircle, label: '訊息', href: createPageUrl('Chat') },
    { icon: FileText, label: '歷史記錄', href: createPageUrl('TransactionHistory') },
    { icon: HelpCircle, label: '幫助中心', href: createPageUrl('Help') },
  ];

  const premiumMenuItems = [
    { icon: Star, label: '瀏覽數據', href: createPageUrl('PropertyViews'), badge: isPremium ? '' : '升級解鎖' },
    { icon: Award, label: '封鎖用戶', href: createPageUrl('BlockedUsers'), badge: isPremium ? '' : '升級解鎖' },
  ];

  const adminMenuItems = isAdmin ? [
    { icon: Shield, label: '舉報管理', href: createPageUrl('AdminReports'), badge: '管理員' },
    { icon: User, label: '用戶管理', href: createPageUrl('AdminUsers'), badge: '管理員' },
  ] : [];

  const favoriteIds = favorites.map(f => f.property_id);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">我的帳戶</h1>
            <Link to={createPageUrl('Home')} className="text-sm text-[#FF385C] font-medium">
              返回首頁
            </Link>
          </div>

          {/* User Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-[#FF385C] text-white text-xl">
                    {(user.full_name || user.email || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{user.full_name || '用戶'}</h2>
                    {isVerified && (
                      <Badge className="bg-green-500 text-white text-xs">已驗證</Badge>
                    )}
                    {isPremium && (
                      <Badge className="bg-amber-400 text-amber-900 text-xs">PRO</Badge>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <VerificationBadge level={isVerified ? 'blue' : 'grey'} size="sm" />
                    <span className="text-xs text-gray-500">
                      {isVerified ? '已完成基本驗證' : '完成驗證解鎖更多功能'}
                    </span>
                  </div>
                </div>
                <Link to={createPageUrl('PersonalInfo')}>
                  <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 mx-auto mb-2 text-[#FF385C]" />
                <p className="text-2xl font-bold">{favorites.length}</p>
                <p className="text-xs text-gray-500">收藏房源</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Building2 className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{myListings.length}</p>
                <p className="text-xs text-gray-500">我的放盤</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-gray-500">評分</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Quick Actions */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <Link 
              to={createPageUrl('CreateListing')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF385C]/10 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#FF385C]" />
                </div>
                <div>
                  <p className="font-semibold">免費放盤</p>
                  <p className="text-sm text-gray-500">業主直讓，零佣金</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="favorites" className="flex-1">
              <Heart className="w-4 h-4 mr-2" />
              收藏 ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex-1">
              <Building2 className="w-4 h-4 mr-2" />
              我的放盤 ({myListings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            {favLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3 animate-pulse">
                    <div className="aspect-[4/3] rounded-2xl bg-gray-200" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : favoriteProperties.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">你還沒有收藏任何房源</p>
                  <Link to={createPageUrl('Search')}>
                    <Button variant="outline">探索房源</Button>
                  </Link>
                </CardContent>
              </Card>
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
          </TabsContent>

          <TabsContent value="listings">
            {listingsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-3 animate-pulse">
                    <div className="aspect-[4/3] rounded-2xl bg-gray-200" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : myListings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">你還沒有放盤</p>
                  <Link to={createPageUrl('CreateListing')}>
                    <Button className="bg-[#FF385C] hover:bg-[#E31C5F]">
                      <Plus className="w-4 h-4 mr-2" />
                      免費放盤
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myListings.map(property => (
                  <div key={property.id} className="relative group">
                    <PropertyCard
                      property={property}
                      isFavorite={favoriteIds.includes(property.id)}
                      onToggleFavorite={() => {}}
                    />
                    <div className="absolute top-3 left-3">
                      <Badge 
                        className={cn(
                          "text-xs",
                          property.status === 'active' && "bg-green-500",
                          property.status === 'pending' && "bg-yellow-500",
                          property.status === 'rented' && "bg-blue-500",
                          property.status === 'sold' && "bg-purple-500"
                        )}
                      >
                        {property.status === 'active' && '刊登中'}
                        {property.status === 'pending' && '審核中'}
                        {property.status === 'rented' && '已租出'}
                        {property.status === 'sold' && '已售出'}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1">
                      <Link to={createPageUrl('EditListing') + `?id=${property.id}`}>
                        <Badge className="text-xs bg-blue-500 hover:bg-blue-600 cursor-pointer">
                          編輯
                        </Badge>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Menu Items */}
        <Card className="mt-6">
          <CardContent className="p-0 divide-y">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              
              return (
                <Link
                  key={idx}
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors",
                    item.premium && "bg-gradient-to-r from-amber-50 to-orange-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-5 h-5", item.premium ? "text-amber-500" : "text-gray-600")} />
                    <span className={item.premium ? "font-medium" : ""}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs",
                          item.premium && item.badge === 'PRO' && "bg-amber-400 text-white",
                          item.verified && "bg-green-500 text-white"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Premium Features Menu */}
        <Card className="mt-4 border-amber-200">
          <CardContent className="p-0 divide-y">
            <div className="px-4 py-2 bg-amber-50">
              <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Premium 功能
              </span>
            </div>
            {premiumMenuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.href}
                  className="flex items-center justify-between p-4 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-amber-600" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge className="text-xs bg-gray-200 text-gray-600">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Admin Menu - Only visible to admins */}
        {adminMenuItems.length > 0 && (
          <Card className="mt-4 border-red-200">
            <CardContent className="p-0 divide-y">
              <div className="px-4 py-2 bg-red-50">
                <span className="text-xs font-medium text-red-600">管理員專區</span>
              </div>
              {adminMenuItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    to={item.href}
                    className="flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-red-600" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge className="text-xs bg-red-500">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Logout */}
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full mt-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          登出
        </Button>

        {/* Delete Account */}
        <Button 
          variant="ghost" 
          onClick={() => setShowDeleteDialog(true)}
          className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          刪除我的帳戶
        </Button>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              永久刪除帳戶
            </DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p>此操作將永久刪除你的帳戶及所有相關資料，包括：</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>所有放盤記錄</li>
                <li>收藏的房源</li>
                <li>對話記錄</li>
                <li>驗證資料</li>
              </ul>
              <p className="font-medium text-red-600">此操作無法復原！</p>
              <p className="text-sm">請輸入「確認刪除」以繼續：</p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="確認刪除"
                className="mt-2"
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== '確認刪除' || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  刪除中...
                </>
              ) : (
                '永久刪除帳戶'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}