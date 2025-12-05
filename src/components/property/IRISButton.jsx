import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ExternalLink, Search, AlertCircle } from 'lucide-react';

export default function IRISButton({ address, className }) {
  const [showModal, setShowModal] = useState(false);

  const handleOpenIRIS = () => {
    // Open official IRIS website for transaction records
    window.open('https://www.iris.gov.hk/', '_blank');
    setShowModal(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowModal(true)}
        className={className}
      >
        <Search className="w-4 h-4 mr-2" />
        查詢實價紀錄
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>物業資訊網 (IRIS)</DialogTitle>
            <DialogDescription>
              查詢土地註冊處的物業成交紀錄
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">什麼是 IRIS？</h4>
              <p className="text-sm text-blue-800">
                IRIS（綜合註冊資訊系統）是土地註冊處的官方系統，
                提供物業查冊服務，包括業權、按揭、成交紀錄等。
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold mb-2">查冊費用</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 文件副本：HKD 10-50</li>
                <li>• 物業資料：HKD 25 起</li>
                <li>• 業權紀錄：HKD 15 起</li>
              </ul>
            </div>

            <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                你將前往土地註冊處官方網站，費用由土地註冊處收取，與直居無關。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button 
              onClick={handleOpenIRIS}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              前往 IRIS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}