import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Home, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PropertyVerification() {
  const [user, setUser] = useState(null);
  const [documentImage, setDocumentImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const result = await base44.integrations.Core.UploadFile({ file });
    if (result.file_url) {
      setDocumentImage(result.file_url);
    }
  };

  const handleSubmit = async () => {
    if (!documentImage) {
      toast.error('請上傳業權證明文件');
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const currentSteps = user.verified_steps || [];
    if (!currentSteps.includes('property')) {
      await base44.auth.updateMe({
        verified_steps: [...currentSteps, 'property']
      });
    }
    
    toast.success('業權驗證成功！你已獲得最高驗證等級！');
    window.location.href = createPageUrl('Verification');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const isAlreadyVerified = (user.verified_steps || []).includes('property');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link to={createPageUrl('Verification')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold ml-2">業權驗證</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        {isAlreadyVerified ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">業權已驗證</h2>
              <p className="text-gray-500">你已獲得最高驗證等級</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Home className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">上傳業權證明</h2>
                <p className="text-gray-500 text-sm">上傳以下其中一種文件：</p>
                <ul className="text-sm text-gray-500 mt-2 space-y-1">
                  <li>• 差餉單</li>
                  <li>• 土地註冊處記錄</li>
                  <li>• 樓契</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-[#FF385C]">
              <CardContent className="p-6">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleUpload}
                  className="hidden"
                  id="doc-upload"
                />
                <label htmlFor="doc-upload" className="cursor-pointer block text-center">
                  {documentImage ? (
                    <div>
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-600">文件已上傳</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">點擊上傳文件</p>
                    </div>
                  )}
                </label>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSubmit}
              disabled={!documentImage || isSubmitting}
              className="w-full bg-[#FF385C] hover:bg-[#E31C5F]"
            >
              {isSubmitting ? '驗證中...' : '提交驗證'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              完成業權驗證後，你的放盤將獲得最高曝光率
            </p>
          </div>
        )}
      </main>
    </div>
  );
}