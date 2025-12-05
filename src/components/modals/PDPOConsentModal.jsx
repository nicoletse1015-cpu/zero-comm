import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Lock, MapPin } from 'lucide-react';

export default function PDPOConsentModal({ onAccept }) {
  const [open, setOpen] = useState(false);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('pdpo_consent');
    if (!hasConsented) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('pdpo_consent', 'true');
    localStorage.setItem('pdpo_consent_date', new Date().toISOString());
    setOpen(false);
    onAccept?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">個人資料保護聲明</DialogTitle>
          <DialogDescription className="text-center">
            根據《個人資料（私隱）條例》(PDPO)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Lock className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">資料加密儲存</p>
              <p className="text-gray-500">你的個人資料將以加密方式安全儲存</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">位置資料用途</p>
              <p className="text-gray-500">僅用於提供附近房源推薦，不會分享予第三方</p>
            </div>
          </div>

          <div className="text-xs text-gray-500 leading-relaxed">
            直居承諾：
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>不會向第三方出售你的個人資料</li>
              <li>僅收集提供服務所需的最少資料</li>
              <li>你可隨時要求查閱或刪除你的資料</li>
              <li>所有通訊內容均經端對端加密</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <Checkbox 
              id="consent" 
              checked={consented}
              onCheckedChange={setConsented}
              className="mt-0.5"
            />
            <span className="text-sm">
              我已閱讀並同意直居的{' '}
              <a href="#" className="text-[#FF385C] underline">私隱政策</a>
              {' '}及{' '}
              <a href="#" className="text-[#FF385C] underline">使用條款</a>
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleAccept}
            disabled={!consented}
            className="w-full bg-[#FF385C] hover:bg-[#E31C5F]"
          >
            同意並繼續
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}