import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Bell, MessageCircle, Heart, Home, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    new_message: true,
    new_inquiry: true,
    price_change: true,
    saved_property: true,
    email_notifications: true
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u.notification_settings) {
        setSettings(u.notification_settings);
      }
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    try {
      await base44.auth.updateMe({ notification_settings: newSettings });
      toast.success('設定已更新');
    } catch (e) {
      toast.error('更新失敗');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const notificationOptions = [
    { key: 'new_message', icon: MessageCircle, title: '新訊息', desc: '當有人傳送訊息給你時通知' },
    { key: 'new_inquiry', icon: Home, title: '新查詢', desc: '當有人查詢你的放盤時通知' },
    { key: 'price_change', icon: Bell, title: '價格變動', desc: '收藏房源價格變動時通知' },
    { key: 'saved_property', icon: Heart, title: '收藏更新', desc: '收藏房源有更新時通知' },
    { key: 'email_notifications', icon: Mail, title: '電郵通知', desc: '透過電郵接收重要通知' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">通知設定</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-0 divide-y">
            {notificationOptions.map(option => {
              const Icon = option.icon;
              return (
                <div key={option.key} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <Label className="font-medium">{option.title}</Label>
                      <p className="text-sm text-gray-500">{option.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[option.key]}
                    onCheckedChange={() => handleToggle(option.key)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}