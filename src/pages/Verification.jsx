import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Shield, Phone, Mail, FileText, Home, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const VERIFICATION_STEPS = [
  { 
    id: 'email', 
    icon: Mail, 
    title: '電郵驗證', 
    desc: '驗證你的電郵地址',
    badge: 'grey'
  },
  { 
    id: 'phone', 
    icon: Phone, 
    title: '電話驗證', 
    desc: '驗證你的電話號碼',
    badge: 'blue'
  },
  { 
    id: 'id', 
    icon: FileText, 
    title: '身份證驗證', 
    desc: '上傳身份證明文件',
    badge: 'green'
  },
  { 
    id: 'property', 
    icon: Home, 
    title: '業權驗證', 
    desc: '上傳差餉單或土地註冊處記錄',
    badge: 'rainbow'
  }
];

export default function Verification() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Force refresh user data to get latest verification status
    base44.auth.me().then(userData => {
      console.log('Verification page - user data:', userData.verified_steps);
      setUser(userData);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const completedSteps = user.verified_steps || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">驗證中心</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF385C]/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#FF385C]" />
              </div>
              <div>
                <CardTitle>提升你的信任度</CardTitle>
                <CardDescription>完成驗證獲得更高曝光率</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-3">
          {VERIFICATION_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <Card key={step.id} className={cn(isCompleted && "border-green-200 bg-green-50/50")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        isCompleted ? "bg-green-100" : "bg-gray-100"
                      )}>
                        <Icon className={cn("w-5 h-5", isCompleted ? "text-green-600" : "text-gray-500")} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{step.title}</p>
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        </div>
                        <p className="text-sm text-gray-500">{step.desc}</p>
                      </div>
                    </div>
                    {!isCompleted && (
                      <Link to={createPageUrl(
                        step.id === 'email' ? 'EmailVerification' :
                        step.id === 'phone' ? 'PhoneVerification' :
                        step.id === 'id' ? 'IDVerification' : 'PropertyVerification'
                      )}>
                        <Button size="sm" variant="outline">
                          開始驗證
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800">
              <strong>驗證好處：</strong>完成越多驗證，你的放盤將獲得更高排名和曝光率，租客/買家也更願意聯絡已驗證的業主。
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}