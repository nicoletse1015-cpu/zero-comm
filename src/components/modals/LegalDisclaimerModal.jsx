import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, FileText, Stamp, Scale } from 'lucide-react';

export default function LegalDisclaimerModal({ open, onClose, onProceed, type = 'rental' }) {
  const [checked, setChecked] = useState(false);

  const handleClose = () => {
    if (checked) {
      onClose();
    }
  };

  const handleProceed = () => {
    if (checked) {
      onProceed();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => !checked && e.preventDefault()}>
        <DialogHeader>
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">重要法律提示</DialogTitle>
          <DialogDescription className="text-center">
            {type === 'rental' ? '租約簽署前請注意' : '物業買賣前請注意'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type === 'rental' ? (
            <>
              <Alert className="border-amber-200 bg-amber-50">
                <Stamp className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>印花稅提醒：</strong>根據《印花稅條例》，所有租約必須於簽署後 30 日內繳納印花稅，否則可被罰款最高 10 倍稅款。
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-200 bg-blue-50">
                <FileText className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>CR109 表格：</strong>業主須於租約開始後 1 個月內向差餉物業估價署提交 CR109 表格，通知物業出租情況。
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Alert className="border-amber-200 bg-amber-50">
              <Scale className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>物業轉讓：</strong>買賣雙方須委託律師處理正式買賣合約及物業轉讓手續。
              </AlertDescription>
            </Alert>
          )}

          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold mb-2">直居平台聲明</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 本平台僅提供業主與租客/買家直接溝通渠道，不參與任何代理行為</li>
              <li>• 正式合約須由律師處理</li>
              <li>• 租約須繳納印花稅及提交 CR109 表格</li>
              <li>• 平台上的意向書不具法律約束力</li>
              <li>• 建議雙方簽約前進行查冊及實地視察</li>
            </ul>
          </div>

          <div className="text-sm text-gray-500">
            如有法律疑問，建議諮詢持牌律師。
            <br />
            <a href="https://www.hklawsoc.org.hk" target="_blank" rel="noopener" className="text-[#FF385C] underline">
              香港律師會律師名冊
            </a>
          </div>
        </div>

        <div className="pt-3 border-t">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              checked={checked} 
              onCheckedChange={setChecked}
            />
            <span className="text-sm font-medium">我已閱讀並明白以上法律須知</span>
          </label>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto" disabled={!checked}>
            {checked ? '稍後再說' : '請先勾選確認'}
          </Button>
          <Button 
            onClick={handleProceed}
            className="w-full sm:w-auto bg-[#FF385C] hover:bg-[#E31C5F]"
            disabled={!checked}
          >
            {checked ? '我已了解，繼續' : '請先勾選確認'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}