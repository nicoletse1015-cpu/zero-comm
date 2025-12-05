import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, Save, Trash2, Camera, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DISTRICTS = [
  '中西區', '灣仔', '東區', '南區',
  '油尖旺', '深水埗', '九龍城', '黃大仙', '觀塘',
  '葵青', '荃灣', '屯門', '元朗', '北區', '大埔', '沙田', '西貢', '離島'
];

const FACINGS = ['東', '南', '西', '北', '東南', '東北', '西南', '西北'];

export default function EditListing() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const results = await base44.entities.Property.filter({ id: propertyId });
      return results[0] || null;
    },
    enabled: !!propertyId && !!user
  });

  useEffect(() => {
    if (property) {
      setFormData(property);
      setUploadedImages(property.images || []);
    }
  }, [property]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Property.update(propertyId, {
        ...data,
        images: uploadedImages
      });
    },
    onSuccess: () => {
      toast.success('放盤已更新');
      queryClient.invalidateQueries(['property', propertyId]);
      window.location.href = createPageUrl('Profile');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Property.delete(propertyId);
    },
    onSuccess: () => {
      toast.success('放盤已刪除');
      queryClient.invalidateQueries(['myListings']);
      queryClient.invalidateQueries(['properties']);
      setTimeout(() => {
        window.location.href = createPageUrl('Profile');
      }, 500);
    },
    onError: (error) => {
      toast.error('刪除失敗，請重試');
      console.error(error);
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Validate file types - HEIC not supported
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(f => !allowedTypes.includes(f.type.toLowerCase()));
    
    if (invalidFiles.length > 0) {
      toast.error('不支援 HEIC 格式，請使用 JPG、PNG 或 WEBP 格式的圖片');
      return;
    }
    
    setIsUploading(true);
    for (const file of files) {
      if (uploadedImages.length >= 20) break;
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result.file_url) {
        setUploadedImages(prev => [...prev, result.file_url]);
      }
    }
    setIsUploading(false);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!formData.title || !formData.price) {
      toast.error('請填寫必填欄位');
      return;
    }
    updateMutation.mutate({
      ...formData,
      price: parseFloat(formData.price) || 0,
      saleable_area: parseFloat(formData.saleable_area) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 1
    });
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  if (!property && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="font-semibold">找不到此放盤</p>
            <Link to={createPageUrl('Profile')}>
              <Button className="mt-4" variant="outline">返回</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">編輯放盤</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">基本資料</h2>
            
            <div>
              <Label>放盤標題 *</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>屋苑名稱</Label>
                <Input
                  value={formData.estate_name || ''}
                  onChange={(e) => handleInputChange('estate_name', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>地區 *</Label>
                <Select 
                  value={formData.district || ''} 
                  onValueChange={(v) => handleInputChange('district', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{formData.listing_type === 'rent' ? '月租 (HKD) *' : '售價 (HKD) *'}</Label>
                <Input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>實用面積 (呎) *</Label>
                <Input
                  type="number"
                  value={formData.saleable_area || ''}
                  onChange={(e) => handleInputChange('saleable_area', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>睡房</Label>
                <Select 
                  value={String(formData.bedrooms || 0)} 
                  onValueChange={(v) => handleInputChange('bedrooms', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} 房</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>浴室</Label>
                <Select 
                  value={String(formData.bathrooms || 1)} 
                  onValueChange={(v) => handleInputChange('bathrooms', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} 浴</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>朝向</Label>
                <Select 
                  value={formData.facing || ''} 
                  onValueChange={(v) => handleInputChange('facing', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACINGS.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">相片</h2>
            
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center",
                isUploading ? "border-[#FF385C]" : "border-gray-300"
              )}
            >
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploading || uploadedImages.length >= 20}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">{isUploading ? '上傳中...' : '點擊上傳相片'}</p>
              </label>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {uploadedImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">特色設施</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'has_sea_view', label: '🌊 海景' },
                { key: 'has_mountain_view', label: '⛰️ 山景' },
                { key: 'has_rooftop', label: '🏠 天台' },
                { key: 'has_balcony', label: '🌿 露台' },
                { key: 'has_garden', label: '🌳 花園' },
              ].map(feature => (
                <label
                  key={feature.key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer",
                    formData[feature.key] ? "border-[#FF385C] bg-[#FF385C]/5" : "border-gray-200"
                  )}
                >
                  <Checkbox
                    checked={formData[feature.key] || false}
                    onCheckedChange={(checked) => handleInputChange(feature.key, checked)}
                  />
                  <span>{feature.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">放盤狀態</h2>
            <Select 
              value={formData.status || 'active'} 
              onValueChange={(v) => handleInputChange('status', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">刊登中</SelectItem>
                <SelectItem value="rented">已租出</SelectItem>
                <SelectItem value="sold">已售出</SelectItem>
                <SelectItem value="withdrawn">已下架</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </main>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="max-w-3xl mx-auto">
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full bg-[#FF385C] hover:bg-[#E31C5F]"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? '儲存中...' : '儲存變更'}
          </Button>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確定刪除此放盤？</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">此操作無法復原，所有相關數據將被永久刪除。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>取消</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '刪除中...' : '確定刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}