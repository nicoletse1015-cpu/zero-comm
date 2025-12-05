import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Home, Shield, Users, TrendingUp } from 'lucide-react';

export default function Welcome() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    base44.auth.me().then(() => {
      window.location.href = createPageUrl('Home');
    }).catch(() => {
      // Not logged in, show welcome page
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 bg-gradient-to-br from-[#FF385C] to-[#E31C5F] rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-2xl">直</span>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Home'));
  };

  const features = [
    { icon: Home, title: '業主直讓', desc: '無需經紀，直接聯絡業主' },
    { icon: Shield, title: '安全可靠', desc: '身份驗證，保障交易' },
    { icon: Users, title: '真實盤源', desc: '杜絕假盤，真實放盤' },
    { icon: TrendingUp, title: '零佣金', desc: '節省高達1個月租金佣金' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1600&auto=format"
            alt="Hong Kong"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-between p-6 md:p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF385C] to-[#E31C5F] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">直</span>
            </div>
            <span className="text-2xl font-bold text-white">直居</span>
          </div>

          {/* Main Content */}
          <div className="text-center md:text-left max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              業主直讓
              <br />
              <span className="text-[#FF385C]">零佣金</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              香港首個 100% P2P 房地產平台
              <br className="hidden md:block" />
              直接聯絡業主，省下過萬元佣金
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <Icon className="w-8 h-8 text-[#FF385C] mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">{feature.title}</p>
                  <p className="text-white/60 text-xs mt-1">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleLogin}
              className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white py-6 text-lg rounded-xl"
            >
              登入 / 註冊
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = createPageUrl('Home')}
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 py-6 text-lg rounded-xl"
            >
              先逛逛
            </Button>
            
            <p className="text-center text-white/60 text-sm">
              登入即表示你同意我們的
              <a href="#" className="text-white underline mx-1">服務條款</a>
              及
              <a href="#" className="text-white underline mx-1">私隱政策</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}