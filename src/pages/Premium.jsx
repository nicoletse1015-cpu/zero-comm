import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronLeft, Crown, Check, Loader2, 
  Sparkles, Building2, MessageCircleOff, ShieldBan, 
  Eye, Star, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Live Price IDs
const MONTHLY_PRICE_ID = 'price_1SaBRsBFWmV0hT52wHdz32Vl';
const YEARLY_PRICE_ID = 'price_1SaBZcBFWmV0hT52x0E7eTkK';

// Premium Features
const PREMIUM_FEATURES = [
  { icon: Eye, title: '優先曝光', desc: '你的放盤會優先出現在搜尋結果頂部' },
  { icon: Building2, title: '無上限放盤', desc: '不限數量發布房源，免費用戶限制 3 個' },
  { icon: Sparkles, title: '精選標籤', desc: '專屬「Premium」標誌，更受租客信賴' },
  { icon: Zap, title: '置頂廣告位', desc: '你的房源會在首頁輪播展示，獲得最大曝光' },
  { icon: Star, title: '查看瀏覽數據', desc: '查看誰瀏覽了你的房源，可直接開啟聊天詢問意向' },
  { icon: MessageCircleOff, title: '刪除聊天室', desc: '隨時刪除不需要的對話記錄' },
  { icon: ShieldBan, title: '封鎖用戶', desc: '封鎖騷擾或不良用戶' },
];

export default function Premium() {
  const [user, setUser] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isLoggedIn = await base44.auth.isAuthenticated();
      if (!isLoggedIn) {
        base44.auth.redirectToLogin();
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Load error:', error);
      base44.auth.redirectToLogin();
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.success('恭喜！你已成為 Premium 會員！');
      window.history.replaceState({}, '', createPageUrl('Premium'));
    } else if (urlParams.get('canceled') === 'true') {
      toast.info('訂閱已取消');
      window.history.replaceState({}, '', createPageUrl('Premium'));
    }
  }, []);

  const handleSubscribe = async (priceId) => {
    setIsSubscribing(priceId);
    try {
      const response = await base44.functions.invoke('stripeSubscription', {
        action: 'createCheckoutSession',
        priceId: priceId,
        successUrl: window.location.origin + createPageUrl('Premium') + '?success=true',
        cancelUrl: window.location.origin + createPageUrl('Premium') + '?canceled=true'
      });

      console.log('Stripe response:', response);

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else if (response.data?.error) {
        toast.error('錯誤: ' + response.data.error);
      } else {
        toast.error('建立付款失敗，請重試');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error('錯誤: ' + (error.message || '建立付款失敗，請重試'));
    } finally {
      setIsSubscribing(null);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>請先登入</p>
      </div>
    );
  }

  const isPremium = user.is_premium && user.premium_expires_at && new Date(user.premium_expires_at) > new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold ml-2">Premium 會員</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        {isPremium ? (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white border-0">
              <CardContent className="p-6 text-center">
                <Crown className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Premium 會員</h2>
                <p className="opacity-90">
                  到期日期：{format(new Date(user.premium_expires_at), 'yyyy年MM月dd日')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">你的專屬權益</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {PREMIUM_FEATURES.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">{feature.title}</p>
                        <p className="text-sm text-gray-500">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">升級成為 Premium</h2>
              <p className="text-gray-500">解鎖所有進階功能，讓您的放盤大放光彩</p>
            </div>

            {/* Features List */}
            <Card className="bg-white">
              <CardContent className="p-6 space-y-4">
                {PREMIUM_FEATURES.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{feature.title}</p>
                        <p className="text-sm text-gray-500">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Monthly Plan - HK$99 */}
            <div className="p-6 border-2 rounded-xl hover:shadow-lg transition-shadow bg-white">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4">月繳方案</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">HK$99</span>
                  <span className="text-xl text-gray-500"> / 月</span>
                </div>
                <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-green-500" />全部進階功能</li>
                  <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-green-500" />無限使用次數</li>
                  <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-green-500" />隨時取消</li>
                </ul>
                <button
                  onClick={() => handleSubscribe(MONTHLY_PRICE_ID)}
                  disabled={!!isSubscribing}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-lg py-4 rounded-lg hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 font-semibold"
                >
                  {isSubscribing === MONTHLY_PRICE_ID ? (
                    <span className="flex items-center justify-center">
                      跳轉中 <Loader2 className="ml-2 w-5 h-5 animate-spin" />
                    </span>
                  ) : (
                    '選擇月繳'
                  )}
                </button>
              </div>
            </div>

            {/* Yearly Plan - HK$950 */}
            <div className="p-6 border-2 border-blue-500 rounded-xl shadow-xl relative overflow-hidden bg-white">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-700 text-white px-6 py-2 text-sm font-bold rounded-bl-lg">
                最划算・省 20%
              </div>
              <div className="text-center pt-4">
                <h3 className="text-2xl font-semibold mb-4">年繳方案</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold">HK$950</span>
                  <span className="text-xl text-gray-500"> / 年</span>
                </div>
                <p className="text-lg text-gray-600 mb-6">平均每月僅 HK$79</p>
                <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-green-500" />全部進階功能</li>
                  <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-green-500" />無限使用次數</li>
                  <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-green-500" />一年一次付款</li>
                </ul>
                <button
                  onClick={() => handleSubscribe(YEARLY_PRICE_ID)}
                  disabled={!!isSubscribing}
                  className="w-full bg-blue-600 text-white text-lg py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                  {isSubscribing === YEARLY_PRICE_ID ? (
                    <span className="flex items-center justify-center">
                      跳轉中 <Loader2 className="ml-2 w-5 h-5 animate-spin" />
                    </span>
                  ) : (
                    '選擇年繳（推薦）'
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              可隨時取消 · 自動續期 · 安全支付由 Stripe 處理
            </p>
          </div>
        )}
      </main>
    </div>
  );
}