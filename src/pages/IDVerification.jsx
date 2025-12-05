import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// HKID Validation Algorithm based on KnugiHK/Hong-Kong-ID-Card-Verification-Algorithm
function validateHKID(hkid) {
  // Remove spaces and convert to uppercase
  const id = hkid.replace(/\s/g, '').toUpperCase();
  
  // Pattern: 1-2 letters + 6 digits + check digit (with or without parentheses)
  const pattern = /^([A-Z]{1,2})(\d{6})\(?([0-9A])\)?$/;
  const match = id.match(pattern);
  
  if (!match) {
    return { valid: false, error: '格式錯誤：請輸入正確的香港身份證號碼格式（例如：A123456(7)）' };
  }
  
  const letters = match[1];
  const numbers = match[2];
  const checkDigit = match[3];
  
  // Calculate checksum
  let sum = 0;
  let multiplier = letters.length === 1 ? 8 : 9;
  
  // Add 36 for space if only one letter (space = 36 in the algorithm)
  if (letters.length === 1) {
    sum += 36 * 9;
    sum += (letters.charCodeAt(0) - 55) * 8;
  } else {
    sum += (letters.charCodeAt(0) - 55) * 9;
    sum += (letters.charCodeAt(1) - 55) * 8;
  }
  
  // Add numbers
  for (let i = 0; i < 6; i++) {
    sum += parseInt(numbers[i]) * (7 - i);
  }
  
  // Calculate expected check digit
  const remainder = sum % 11;
  let expectedCheckDigit;
  
  if (remainder === 0) {
    expectedCheckDigit = '0';
  } else if (remainder === 1) {
    expectedCheckDigit = 'A';
  } else {
    expectedCheckDigit = String(11 - remainder);
  }
  
  if (checkDigit !== expectedCheckDigit) {
    return { valid: false, error: '校驗碼錯誤：身份證號碼無效' };
  }
  
  return { valid: true, formattedId: `${letters}${numbers}(${checkDigit})` };
}

export default function IDVerification() {
  const [user, setUser] = useState(null);
  const [hkid, setHkid] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const handleValidate = () => {
    if (!hkid.trim()) {
      setValidationResult({ valid: false, error: '請輸入身份證號碼' });
      return;
    }
    
    const result = validateHKID(hkid);
    setValidationResult(result);
    
    if (result.valid) {
      toast.success('身份證號碼格式正確！');
    }
  };

  const handleSubmit = async () => {
    if (!validationResult?.valid) {
      toast.error('請先驗證身份證號碼');
      return;
    }
    
    setIsSubmitting(true);
    
    const currentSteps = user.verified_steps || [];
    if (!currentSteps.includes('id')) {
      await base44.auth.updateMe({
        verified_steps: [...currentSteps, 'id'],
        hkid_verified: true
      });
    }
    
    toast.success('身份證驗證成功！');
    window.location.href = createPageUrl('Verification');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const isAlreadyVerified = (user.verified_steps || []).includes('id');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link to={createPageUrl('Verification')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold ml-2">身份證驗證</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        {isAlreadyVerified ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">身份證已驗證</h2>
              <p className="text-gray-500">你的香港身份證已通過驗證</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">香港身份證驗證</h2>
                <p className="text-gray-500 text-sm">
                  輸入你的香港身份證號碼（含校驗碼）進行驗證
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>身份證號碼</Label>
                  <Input
                    value={hkid}
                    onChange={(e) => {
                      setHkid(e.target.value);
                      setValidationResult(null);
                    }}
                    placeholder="例如：A123456(7)"
                    className="mt-1 text-lg font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    格式：1-2個英文字母 + 6位數字 + 校驗碼（括號內）
                  </p>
                </div>

                {validationResult && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    validationResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {validationResult.valid ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span>身份證號碼有效：{validationResult.formattedId}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{validationResult.error}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleValidate}
                    variant="outline"
                    className="flex-1"
                  >
                    驗證號碼
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!validationResult?.valid || isSubmitting}
                    className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F]"
                  >
                    {isSubmitting ? '提交中...' : '確認提交'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">關於身份證驗證</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 驗證使用香港身份證校驗碼演算法</li>
                  <li>• 本地計算，資料不會上傳</li>
                  <li>• 驗證成功後獲得綠色認證徽章</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}