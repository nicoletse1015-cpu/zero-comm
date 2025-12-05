import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, Scale, Building2, ExternalLink, CheckCircle2, ArrowRight, Briefcase
} from 'lucide-react';

export default function SaleLegalInfo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Help')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">買賣法律須知</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center mb-6">
          <Scale className="w-12 h-12 mx-auto text-[#FF385C] mb-3" />
          <h2 className="text-2xl font-bold">買賣法律須知</h2>
          <p className="text-gray-500 mt-1">請仔細閱讀以下重要資訊</p>
        </div>

        {/* 買賣須知 */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-2">重要須知</h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  香港住宅物業買賣<strong>必須由執業律師處理</strong>，所有臨時買賣合約、正式合約、轉讓契、印花稅、土地註冊處登記等，均需律師負責。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 直居平台聲明 */}
        <Card className="border-[#FF385C]/30 bg-[#FF385C]/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#FF385C] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-[#FF385C] mb-3">直居平台聲明</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF385C]">•</span>
                    直居僅提供業主與買家直接溝通渠道
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF385C]">•</span>
                    僅提供律師推薦服務，不參與任何法律文件製作或簽署
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF385C]">•</span>
                    平台上的意向書不具法律約束力
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF385C]">•</span>
                    直居不參與任何代理行為，毋須持有地產代理牌照
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF385C]">•</span>
                    建議雙方簽約前實地視察及查冊
                  </li>
                </ul>
                <div className="mt-3 p-2 bg-white rounded-lg">
                  <p className="text-xs text-gray-500">
                    如有法律疑問，請諮詢執業律師
                    <a 
                      href="https://www.hklawsoc.org.hk" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#FF385C] ml-1 inline-flex items-center gap-1 hover:underline"
                    >
                      香港律師會名冊 <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 買賣交易流程 */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            買賣交易流程
          </h3>
          
          <div className="p-4 bg-gray-50 rounded-xl mb-4">
            <p className="text-center text-sm text-gray-600">
              談好價 <ArrowRight className="w-4 h-4 inline mx-1" />
              雙方傳送意向書 <ArrowRight className="w-4 h-4 inline mx-1" />
              平台即時推薦平價律師樓 <ArrowRight className="w-4 h-4 inline mx-1" />
              雙方自行聯絡律師到律師樓簽約、付訂金及完成交易
            </p>
          </div>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-800 mb-2">律師處理事項</h4>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• 臨時買賣合約</li>
                    <li>• 正式買賣合約</li>
                    <li>• 轉讓契</li>
                    <li>• 印花稅繳納</li>
                    <li>• 土地註冊處登記</li>
                    <li>• 資金轉移</li>
                    <li>• 文件註冊</li>
                    <li>• 查冊（審查業權、確認物業狀態、檢查「釘契」問題、審查按揭狀況、審查賣方狀況如破產或公司清盤）</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pb-8">
          <Link to={createPageUrl('Help')}>
            <Button className="w-full bg-[#FF385C] hover:bg-[#E31C5F]">
              返回
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}