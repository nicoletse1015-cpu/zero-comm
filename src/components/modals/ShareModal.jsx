import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Facebook, MessageCircle, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareModal({ open, onClose, property }) {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = window.location.href;
  const shareText = property ? `${property.title} - HKD ${property.price.toLocaleString()}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('連結已複製');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      email: `mailto:?subject=${encodedText}&body=${encodedUrl}`
    };
    
    window.open(urls[platform], '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享房源</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Copy Link */}
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button onClick={copyLink} variant="outline">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          {/* Share Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => shareVia('whatsapp')}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <MessageCircle className="w-6 h-6 text-green-500" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => shareVia('facebook')}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Facebook className="w-6 h-6 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => shareVia('email')}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Mail className="w-6 h-6 text-gray-600" />
              <span className="text-xs">電郵</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}