import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, ChevronRight, Upload, X, Home, Camera,
  MapPin, DollarSign, Bed, Info, Check, AlertCircle, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import RentalLegalNotice from '@/components/legal/RentalLegalNotice';
import SaleLegalNotice from '@/components/legal/SaleLegalNotice';

const DISTRICTS = [
  '中西區', '灣仔', '東區', '南區',
  '油尖旺', '深水埗', '九龍城', '黃大仙', '觀塘',
  '葵青', '荃灣', '屯門', '元朗', '北區', '大埔', '沙田', '西貢', '離島'
];

const PROPERTY_TYPES = [
  { value: '公寓', label: '私人住宅/公寓' },
  { value: '獨立屋', label: '獨立屋' },
  { value: '村屋', label: '村屋' },
  { value: '唐樓', label: '唐樓' },
  { value: '居屋', label: '居屋' },
  { value: '公屋', label: '公屋' }
];

const FACINGS = ['東', '南', '西', '北', '東南', '東北', '西南', '西北'];

export default function CreateListingPage() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [existingListingsCount, setExistingListingsCount] = useState(0);
  const [formData, setFormData] = useState({
    listing_type: 'rent',
    property_type: '公寓',
    title: '',
    estate_name: '',
    district: '',
    address: '',
    price: '',
    saleable_area: '',
    gross_area: '',
    bedrooms: '',
    bathrooms: '1',
    living_rooms: '1',
    floor: '',
    building_age: '',
    facing: '',
    nearest_mtr: '',
    mtr_walk_minutes: '',
    has_rooftop: false,
    has_balcony: false,
    has_garden: false,
    has_sea_view: false,
    has_mountain_view: false,
    features: [],
    description: '',
    pets_allowed: '',
    preferred_tenant: '',
    negotiable: ''
  });

  // Free user listing limit
  const FREE_LISTING_LIMIT = 3;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = await base44.auth.isAuthenticated();
        if (!isLoggedIn) {
          base44.auth.redirectToLogin();
          return;
        }
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  // Check existing listings count for free users
  useEffect(() => {
    const checkListings = async () => {
      if (!user) return;
      const listings = await base44.entities.Property.filter({ owner_id: String(user.id) });
      setExistingListingsCount(listings.length);
    };
    checkListings();
  }, [user]);

  const [legalChecked, setLegalChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

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
      alert('不支援 HEIC 格式，請使用 JPG、PNG 或 WEBP 格式的圖片');
      return;
    }
    
    setIsUploading(true);
    
    for (const file of files) {
      if (uploadedImages.length >= 20) break;
      
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result.file_url) {
        // Use AI to verify the image is property-related
        const verification = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an image content moderator for a real estate platform. Analyze this image and determine if it is appropriate for a property listing. The image should be of:
- Interior rooms (living room, bedroom, kitchen, bathroom, etc.)
- Exterior views of the property
- Building amenities
- Floor plans or layouts
- Neighborhood or surroundings

The image should NOT contain:
- People as the main subject
- Inappropriate or adult content
- Unrelated objects or scenes
- Screenshots or text-heavy images
- Logos or watermarks from other real estate agencies

Based on the image, respond with JSON: {"approved": true/false, "reason": "brief reason"}`,
          file_urls: [result.file_url],
          response_json_schema: {
            type: "object",
            properties: {
              approved: { type: "boolean" },
              reason: { type: "string" }
            },
            required: ["approved", "reason"]
          }
        });
        
        if (verification.approved) {
          setUploadedImages(prev => [...prev, result.file_url]);
        } else {
          alert(`相片未通過審核：${verification.reason}\n請上傳物業相關的相片。`);
        }
      }
    }
    
    setIsUploading(false);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    // Check if user is premium
    const isPremium = user.is_premium && user.premium_expires_at && new Date(user.premium_expires_at) > new Date();
    
    const propertyData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      saleable_area: parseFloat(formData.saleable_area) || 0,
      gross_area: parseFloat(formData.gross_area) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 1,
      living_rooms: parseInt(formData.living_rooms) || 1,
      building_age: parseInt(formData.building_age) || 0,
      mtr_walk_minutes: parseInt(formData.mtr_walk_minutes) || 0,
      images: uploadedImages,
      owner_id: String(user.id),
      owner_name: user.full_name || user.email,
      owner_is_premium: isPremium, // 精選標籤 + 優先曝光
      status: 'active',
      verification_level: 'grey'
    };
    
    await base44.entities.Property.create(propertyData);
    window.location.href = createPageUrl('Profile');
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.listing_type && formData.property_type;
      case 2:
        return formData.title && formData.district && formData.price && formData.saleable_area && formData.bedrooms;
      case 3:
        return uploadedImages.length >= 1;
      case 4:
        return legalChecked;
      case 5:
        return termsChecked;
      default:
        return false;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const isPremium = user.is_premium && user.premium_expires_at && new Date(user.premium_expires_at) > new Date();
  const hasReachedFreeLimit = !isPremium && existingListingsCount >= FREE_LISTING_LIMIT;

  // Show upgrade prompt if free user has reached limit
  if (hasReachedFreeLimit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
            <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold ml-2">免費放盤</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">已達免費放盤上限</h2>
              <p className="text-gray-500 mb-2">
                免費用戶最多可放盤 {FREE_LISTING_LIMIT} 個物業
              </p>
              <p className="text-gray-500 mb-6">
                你目前已有 {existingListingsCount} 個放盤
              </p>
              <Link to={createPageUrl('Premium')}>
                <Button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  升級 Premium · 無上限放盤
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          {step === 1 ? (
            <Link to={createPageUrl('Home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          ) : (
            <button 
              type="button"
              onClick={() => setStep(s => s - 1)} 
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="font-semibold">免費放盤</h1>
          <div className="w-9" />
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">你想放盤嘅類型？</h2>
              <p className="text-gray-500">選擇出租或出售</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'rent', label: '出租', desc: '每月租金' },
                { value: 'sale', label: '出售', desc: '一次性售價' }
              ].map(type => (
                <Card 
                  key={type.value}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    formData.listing_type === type.value && "ring-2 ring-[#FF385C]"
                  )}
                  onClick={() => handleInputChange('listing_type', type.value)}
                >
                  <CardContent className="p-6 text-center">
                    <Home className={cn(
                      "w-10 h-10 mx-auto mb-3",
                      formData.listing_type === type.value ? "text-[#FF385C]" : "text-gray-400"
                    )} />
                    <p className="font-semibold text-lg">{type.label}</p>
                    <p className="text-sm text-gray-500">{type.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">物業類型</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('property_type', type.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      formData.property_type === type.value
                        ? "border-[#FF385C] bg-[#FF385C]/5"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <p className="font-medium">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Property Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">物業詳情</h2>
              <p className="text-gray-500">填寫你的物業資料</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>放盤標題 *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="例：太古城海景3房，業主直讓"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>屋苑名稱</Label>
                  <Input
                    value={formData.estate_name}
                    onChange={(e) => handleInputChange('estate_name', e.target.value)}
                    placeholder="例：太古城"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>地區 *</Label>
                  <Select 
                    value={formData.district} 
                    onValueChange={(v) => handleInputChange('district', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="選擇地區" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>詳細地址</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="例：太古城道100號"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{formData.listing_type === 'rent' ? '月租 (HKD) *' : '售價 (HKD) *'}</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder={formData.listing_type === 'rent' ? '例：25000' : '例：10000000'}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>實用面積 (呎) *</Label>
                  <Input
                    type="number"
                    value={formData.saleable_area}
                    onChange={(e) => handleInputChange('saleable_area', e.target.value)}
                    placeholder="例：800"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>睡房 *</Label>
                  <Select 
                    value={formData.bedrooms} 
                    onValueChange={(v) => handleInputChange('bedrooms', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="選擇" />
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
                    value={formData.bathrooms} 
                    onValueChange={(v) => handleInputChange('bathrooms', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="選擇" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} 浴</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>客廳</Label>
                  <Select 
                    value={formData.living_rooms} 
                    onValueChange={(v) => handleInputChange('living_rooms', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="選擇" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} 廳</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>樓層</Label>
                  <Input
                    value={formData.floor}
                    onChange={(e) => handleInputChange('floor', e.target.value)}
                    placeholder="例：中層"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>朝向</Label>
                  <Select 
                    value={formData.facing} 
                    onValueChange={(v) => handleInputChange('facing', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="選擇朝向" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACINGS.map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>最近港鐵站</Label>
                  <Input
                    value={formData.nearest_mtr}
                    onChange={(e) => handleInputChange('nearest_mtr', e.target.value)}
                    placeholder="例：太古"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>步行時間 (分鐘)</Label>
                  <Input
                    type="number"
                    value={formData.mtr_walk_minutes}
                    onChange={(e) => handleInputChange('mtr_walk_minutes', e.target.value)}
                    placeholder="例：5"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Owner Custom Description Section */}
              <div className="pt-4 border-t mt-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#FF385C]" />
                  業主自訂描述
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>物業描述 / 特色 / 優勢</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="例：剛裝修完，全屋新傢俬電器，近巴士站，樓下有超市..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>可否養寵物</Label>
                      <Select 
                        value={formData.pets_allowed} 
                        onValueChange={(v) => handleInputChange('pets_allowed', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="選擇" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">可以養寵物</SelectItem>
                          <SelectItem value="no">不可養寵物</SelectItem>
                          <SelectItem value="negotiable">可商議</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>可否議價</Label>
                      <Select 
                        value={formData.negotiable} 
                        onValueChange={(v) => handleInputChange('negotiable', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="選擇" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">可議價</SelectItem>
                          <SelectItem value="no">不議價</SelectItem>
                          <SelectItem value="slight">小議</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>偏好租客 / 買家</Label>
                    <Input
                      value={formData.preferred_tenant}
                      onChange={(e) => handleInputChange('preferred_tenant', e.target.value)}
                      placeholder="例：家庭優先、不吸煙、專業人士..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">上傳相片</h2>
              <p className="text-gray-500">最少 1 張，最多 20 張相片</p>
            </div>

            <div 
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center transition-colors",
                isUploading ? "border-[#FF385C] bg-[#FF385C]/5" : "border-gray-300 hover:border-gray-400"
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
                <Camera className={cn(
                  "w-12 h-12 mx-auto mb-4",
                  isUploading ? "text-[#FF385C] animate-pulse" : "text-gray-400"
                )} />
                <p className="font-semibold mb-1">
                  {isUploading ? '上傳中...' : '點擊上傳相片'}
                </p>
                <p className="text-sm text-gray-500">
                  支援 JPG, PNG 格式
                </p>
              </label>
            </div>

            {/* Uploaded Images Grid */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {uploadedImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                        封面
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-500 text-center">
              已上傳 {uploadedImages.length} / 20 張
            </p>
          </div>
        )}

        {/* Step 4: Legal Notice */}
        {step === 4 && (
          <div className="space-y-6">
            {formData.listing_type === 'rent' ? (
              <RentalLegalNotice onAllChecked={setLegalChecked} />
            ) : (
              <SaleLegalNotice onAllChecked={setLegalChecked} />
            )}
          </div>
        )}

        {/* Step 5: Features & Confirm */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">特色設施</h2>
              <p className="text-gray-500">選擇適用的特色</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    formData[feature.key]
                      ? "border-[#FF385C] bg-[#FF385C]/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Checkbox
                    checked={formData[feature.key]}
                    onCheckedChange={(checked) => handleInputChange(feature.key, checked)}
                  />
                  <span className="font-medium">{feature.label}</span>
                </label>
              ))}
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Checkbox 
                id="terms" 
                checked={termsChecked}
                onCheckedChange={setTermsChecked}
              />
              <label htmlFor="terms" className="text-sm">
                我確認以上資料真實無誤，並同意直居的{' '}
                <a href="#" className="text-[#FF385C] underline">使用條款</a>
                {' '}及{' '}
                <a href="#" className="text-[#FF385C] underline">私隱政策</a>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setStep(prev => prev - 1)}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>
          )}
          {step < totalSteps ? (
            <Button 
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F]"
            >
              下一步
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F]"
            >
              {isSubmitting ? '提交中...' : '免費發布'}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}