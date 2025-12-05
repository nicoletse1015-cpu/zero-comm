import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PhoneVerification() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [codeSent, setCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setPhone(u.phone || '');
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const sendCode = async () => {
    if (!phone || phone.length < 8) {
      toast.error('請輸入有效的香港電話號碼');
      return;
    }

    setIsSending(true);
    try {
      const response = await base44.functions.invoke('firebaseAuth', {
        action: 'sendSmsVerification',
        phoneNumber: phone
      });

      if (response.data?.success) {
        setSessionInfo(response.data.sessionInfo);
        setCodeSent(true);
        toast.success('驗證碼已發送到你的手機');
      } else {
        toast.error(response.data?.error || '發送失敗，請重試');
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error('發送失敗，請重試');
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error('請輸入6位驗證碼');
      return;
    }

    setIsVerifying(true);
    try {
      // Twilio Verify verification
      const response = await base44.functions.invoke('firebaseAuth', {
        action: 'verifySmsCode',
        sessionInfo,
        code: verificationCode
      });

      if (response.data?.success) {
        await updateVerificationStatus();
      } else {
        toast.error(response.data?.error || '驗證碼不正確');
        setVerificationCode(''); // Clear the code so user can retry
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error('驗證失敗，請重試');
      setVerificationCode(''); // Clear the code so user can retry
    } finally {
      setIsVerifying(false);
    }
  };

  const updateVerificationStatus = async () => {
    const currentSteps = user.verified_steps || [];
    if (!currentSteps.includes('phone')) {
      const newSteps = [...currentSteps, 'phone'];
      await base44.auth.updateMe({
        phone: `+852${phone.replace(/\D/g, '')}`,
        verified_steps: newSteps,
        phone_verified: true,
        phone_verified_at: new Date().toISOString()
      });
      // Update local user state immediately
      setUser(prev => ({ ...prev, verified_steps: newSteps, phone_verified: true }));
    }
    
    toast.success('電話驗證成功！');
    // Small delay to ensure data is saved
    setTimeout(() => {
      window.location.href = createPageUrl('Verification');
    }, 500);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const isAlreadyVerified = (user.verified_steps || []).includes('phone');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link to={createPageUrl('Verification')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold ml-2">電話驗證</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        {isAlreadyVerified ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">電話已驗證</h2>
              <p className="text-gray-500">{user.phone}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">驗證你的電話</h2>
                <p className="text-sm text-gray-500">我們會透過 SMS 發送驗證碼</p>
              </div>

              {!codeSent ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="w-20 flex items-center justify-center border rounded-lg bg-gray-50 font-medium">
                      +852
                    </div>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="電話號碼"
                      type="tel"
                      className="flex-1"
                      maxLength={8}
                    />
                  </div>
                  <Button 
                    onClick={sendCode} 
                    disabled={isSending || phone.length < 8}
                    className="w-full bg-[#FF385C] hover:bg-[#E31C5F]"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        發送中...
                      </>
                    ) : (
                      '發送驗證碼'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-sm text-gray-600">
                    驗證碼已發送至 +852 {phone}
                  </p>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="輸入6位驗證碼"
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <Button 
                    onClick={verifyCode} 
                    disabled={verificationCode.length !== 6 || isVerifying}
                    className="w-full bg-[#FF385C] hover:bg-[#E31C5F]"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        驗證中...
                      </>
                    ) : (
                      '確認驗證'
                    )}
                  </Button>
                  <button 
                    onClick={() => {
                      setCodeSent(false);
                      setVerificationCode('');
                    }} 
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    更改電話號碼
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}