import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, HelpCircle, MessageCircle, FileText, Shield, Home, DollarSign, Scale, Calculator } from 'lucide-react';
import { toast } from 'sonner';

const HELP_TOPICS = [
  {
    icon: Home,
    title: '如何放盤？',
    desc: '了解免費放盤的流程',
    topic: 'listing'
  },
  {
    icon: MessageCircle,
    title: '如何聯絡業主？',
    desc: '了解如何與業主溝通',
    topic: 'contact'
  },
  {
    icon: DollarSign,
    title: '零佣金如何運作？',
    desc: '了解直居的收費模式',
    topic: 'commission'
  },
  {
    icon: Shield,
    title: '安全交易指南',
    desc: '保障你的交易安全',
    topic: 'safety'
  },
  {
    icon: FileText,
    title: '免責聲明',
    desc: '了解平台法律責任及私隱政策',
    topic: 'legal'
  },
  {
    icon: HelpCircle,
    title: '其他常見問題',
    desc: '查看其他用戶常問問題',
    topic: 'faq'
  }
];

const LEGAL_PAGES = [
  {
    icon: Scale,
    title: '租賃法律須知',
    desc: '印花稅、CR109、租約要求及交易流程',
    page: 'RentalLegalInfo'
  },
  {
    icon: Scale,
    title: '買賣法律須知',
    desc: '物業買賣流程及律師處理事項',
    page: 'SaleLegalInfo'
  },
  {
    icon: Calculator,
    title: '厘印費計算機',
    desc: '計算固定/非固定租約的印花稅',
    page: 'StampDutyCalculator'
  }
];

export default function Help() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">幫助中心</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 法律須知專區 */}
        <div>
          <h2 className="text-lg font-semibold mb-3 px-1">📜 法律須知專區</h2>
          <Card className="border-[#FF385C]/30">
            <CardContent className="p-0 divide-y">
              {LEGAL_PAGES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={idx}
                    to={createPageUrl(item.page)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#FF385C]/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF385C]/10 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#FF385C]" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* 一般幫助 */}
        <div>
          <h2 className="text-lg font-semibold mb-3 px-1">❓ 常見問題</h2>
          <Card>
            <CardContent className="p-0 divide-y">
              {HELP_TOPICS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={idx}
                    to={createPageUrl('HelpDetail') + `?topic=${item.topic}`}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF385C]/10 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#FF385C]" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#FF385C]/5 border-[#FF385C]/20">
          <CardContent className="p-4 text-center">
            <p className="font-medium text-gray-900 mb-1">仍需要幫助？</p>
            <p className="text-sm text-gray-600 mb-3">我們的客服團隊隨時為你服務</p>
            <a 
              href="mailto:support@straighthome.hk"
              className="inline-block px-4 py-2 bg-[#FF385C] text-white rounded-full text-sm font-medium hover:bg-[#E31C5F] transition-colors"
            >
              聯絡客服
            </a>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}