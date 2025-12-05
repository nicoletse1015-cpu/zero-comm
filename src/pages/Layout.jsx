
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: Home, label: '首頁', page: 'Home' },
  { icon: Search, label: '搜尋', page: 'Search' },
  { icon: Heart, label: '收藏', page: 'Favorites' },
  { icon: MessageCircle, label: '訊息', page: 'Chat' },
  { icon: User, label: '我的', page: 'Profile' },
];

// Pages that should not show the bottom nav
const HIDE_NAV_PAGES = ['Chat', 'CreateListing', 'PropertyDetail', 'Favorites', 'Welcome'];

// Pages that don't require ban check (public pages)
const PUBLIC_PAGES = ['Welcome'];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isBanned, setIsBanned] = useState(false);
  const [checkingBan, setCheckingBan] = useState(true);

  useEffect(() => {
    const checkBanStatus = async () => {
      try {
        const isLoggedIn = await base44.auth.isAuthenticated();
        if (isLoggedIn) {
          const u = await base44.auth.me();
          setUser(u);
          if (u?.is_banned && !PUBLIC_PAGES.includes(currentPageName)) {
            setIsBanned(true);
          }
        }
      } catch (e) {
        // Not logged in
      } finally {
        setCheckingBan(false);
      }
    };
    checkBanStatus();
  }, [currentPageName]);

  const showBottomNav = !HIDE_NAV_PAGES.includes(currentPageName);

  // Show loading while checking ban status
  if (checkingBan && !PUBLIC_PAGES.includes(currentPageName)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  // Show banned message if user is banned
  if (isBanned) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">帳戶已被停用</h1>
          <p className="text-gray-500 mb-6">你的帳戶因違反使用條款已被管理員停用。如有疑問，請聯絡客服。</p>
          <button
            onClick={() => base44.auth.logout(createPageUrl('Welcome'))}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            登出
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        :root {
          --airbnb-red: #FF385C;
          --airbnb-red-dark: #E31C5F;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes heart-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        
        .heart-animate {
          animation: heart-pop 0.3s ease-in-out;
        }
      `}</style>
      
      {children}
      
      {/* Mobile Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50 pb-safe">
          <div className="flex items-center justify-around py-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-2 transition-colors",
                    isActive ? "text-[#FF385C]" : "text-gray-500"
                  )}
                >
                  <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
