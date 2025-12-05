import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

const REPORT_REASONS = [
  { value: 'fake', label: '虛假放盤' },
  { value: 'scam', label: '懷疑詐騙' },
  { value: 'inappropriate', label: '不當內容/圖片' },
  { value: 'wrong_info', label: '資料不正確' },
  { value: 'duplicate', label: '重複放盤' },
  { value: 'other', label: '其他' }
];

export default function ReportModal({ open, onClose, propertyId }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('請選擇舉報原因');
      return;
    }
    
    setIsSubmitting(true);
    
    await base44.entities.Report.create({
      property_id: propertyId,
      reporter_id: user?.id ? String(user.id) : 'anonymous',
      reason,
      details,
      status: 'pending'
    });
    
    toast.success('舉報已提交，管理員會盡快處理');
    setIsSubmitting(false);
    setReason('');
    setDetails('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            舉報此房源
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map(r => (
              <div key={r.value} className="flex items-center space-x-2">
                <RadioGroupItem value={r.value} id={r.value} />
                <Label htmlFor={r.value}>{r.label}</Label>
              </div>
            ))}
          </RadioGroup>
          
          <div>
            <Label>補充說明（選填）</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="請提供更多詳情..."
              className="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-[#FF385C] hover:bg-[#E31C5F]"
          >
            {isSubmitting ? '提交中...' : '提交舉報'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}