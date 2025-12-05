import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calculator, ExternalLink } from 'lucide-react';

const IRD_CALCULATOR_URL = 'https://www.ird.gov.hk/chi/ese/sd_comp/csdta.htm';

export default function StampDutyCalculator() {
  // Auto redirect to IRD calculator
  useEffect(() => {
    window.open(IRD_CALCULATOR_URL, '_blank');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link to={createPageUrl('Help')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold ml-2">厘印費計算機</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-[#FF385C]/10 rounded-full flex items-center justify-center mx-auto">
              <Calculator className="w-8 h-8 text-[#FF385C]" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-2">香港稅務局官方計算機</h2>
              <p className="text-gray-500 text-sm">
                為確保計算準確，我們直接導向香港稅務局官方厘印費計算機
              </p>
            </div>
            
            <Button 
              onClick={() => window.open(IRD_CALCULATOR_URL, '_blank')}
              className="w-full bg-[#FF385C] hover:bg-[#E31C5F]"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              前往稅務局計算機
            </Button>
            
            <p className="text-xs text-gray-400">
              計算機將在新視窗開啟
            </p>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">厘印費率參考</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-medium">固定租約</p>
                <ul className="text-xs mt-1 space-y-0.5">
                  <li>• 1年或以下：年租 × 0.25%</li>
                  <li>• 超過1年至3年：年租 × 0.5%</li>
                  <li>• 超過3年：年租 × 1%</li>
                </ul>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-medium">非固定租約</p>
                <ul className="text-xs mt-1">
                  <li>• 年租 × 0.25%</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}