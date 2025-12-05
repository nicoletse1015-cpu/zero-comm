import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ChevronLeft, Camera, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalInfo() {
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: '',
    birthday: '',
    bio: '',
    status: ''
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFormData({
        full_name: u.full_name || '',
        phone: u.phone || '',
        gender: u.gender || '',
        birthday: u.birthday || '',
        bio: u.bio || '',
        status: u.status || ''
      });
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        full_name: formData.full_name,
        phone: formData.phone,
        gender: formData.gender,
        birthday: formData.birthday,
        bio: formData.bio,
        status: formData.status
      });
      
      toast.success('個人資料已更新');
      setUser(prev => ({ ...prev, ...formData }));
    } catch (error) {
      console.error('Save error:', error);
      toast.error('更新失敗，請重試');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const verifiedSteps = user.verified_steps || [];
  const isVerified = verifiedSteps.length >= 2;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">個人資料</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Avatar Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-[#FF385C] text-white text-3xl">
                    {(formData.full_name || user.email || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">{user.email}</p>
                {isVerified && (
                  <Badge className="mt-2 bg-green-500">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    已驗證
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">基本資料</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">顯示名稱</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="輸入你的名稱"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">狀態訊息</Label>
              <Input
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="例如：正在尋找3房單位"
                maxLength={50}
              />
              <p className="text-xs text-gray-400">{formData.status.length}/50 字</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">電話號碼</Label>
              <div className="flex gap-2">
                <div className="w-20 flex items-center justify-center border rounded-lg bg-gray-50 text-sm">
                  +852
                </div>
                <Input
                  id="phone"
                  value={formData.phone?.replace('+852', '')}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="電話號碼"
                  type="tel"
                  className="flex-1"
                  maxLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">性別</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇性別" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">生日</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">自我介紹</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="簡單介紹一下自己..."
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-gray-400">{formData.bio.length}/200 字</p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#FF385C] hover:bg-[#E31C5F]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              儲存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              儲存變更
            </>
          )}
        </Button>

        {/* Verification Link */}
        {!isVerified && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <p className="text-sm text-amber-800 mb-3">
                完成驗證可提升你的信任度，讓更多人願意與你交易！
              </p>
              <Link to={createPageUrl('Verification')}>
                <Button variant="outline" className="w-full border-amber-400 text-amber-700 hover:bg-amber-100">
                  前往驗證中心
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}