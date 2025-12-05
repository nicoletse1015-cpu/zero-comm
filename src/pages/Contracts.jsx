import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, FileText, Plus, Calendar, Home, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_MAP = {
  draft: { label: '草稿', color: 'bg-gray-500' },
  pending_signature: { label: '待簽署', color: 'bg-yellow-500' },
  active: { label: '生效中', color: 'bg-green-500' },
  expired: { label: '已過期', color: 'bg-gray-400' },
  terminated: { label: '已終止', color: 'bg-red-500' }
};

export default function Contracts() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: async () => {
      const asLandlord = await base44.entities.Contract.filter({ landlord_id: String(user?.id) });
      const asTenant = await base44.entities.Contract.filter({ tenant_id: String(user?.id) });
      return [...asLandlord, ...asTenant];
    },
    enabled: !!user?.id
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const activeContracts = contracts.filter(c => c.status === 'active');
  const otherContracts = contracts.filter(c => c.status !== 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">租約管理</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">暫無租約記錄</h3>
              <p className="text-gray-500 text-sm mb-4">
                當你透過直居完成租賃交易後，租約將會顯示在這裡
              </p>
              <Link to={createPageUrl('Search')}>
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  瀏覽房源
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="active" className="flex-1">生效中 ({activeContracts.length})</TabsTrigger>
              <TabsTrigger value="other" className="flex-1">其他 ({otherContracts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <div className="space-y-3">
                {activeContracts.map(contract => (
                  <ContractCard key={contract.id} contract={contract} userId={user.id} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="other">
              <div className="space-y-3">
                {otherContracts.map(contract => (
                  <ContractCard key={contract.id} contract={contract} userId={user.id} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Contract Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">租約範本</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="https://www.rvd.gov.hk/tc/forms/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">CR109 表格</p>
                  <p className="text-xs text-gray-500">差餉物業估價署表格下載</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
            
            <a 
              href="https://www.landsd.gov.hk/tc/legco/house-policy.htm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">租務條例資訊</p>
                  <p className="text-xs text-gray-500">地政總署</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
            
            <a 
              href="https://www.ird.gov.hk/chi/tax/sdu.htm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium">印花稅資訊</p>
                  <p className="text-xs text-gray-500">稅務局官網</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">租約須知</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 所有租約須由律師處理正式簽署</li>
              <li>• 租約須繳納印花稅（通常0.25%-4.25%）</li>
              <li>• 業主須向差餉物業估價署提交 CR109 表格</li>
              <li>• 建議保留所有付款收據作記錄</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function ContractCard({ contract, userId }) {
  const isLandlord = contract.landlord_id === String(userId);
  const status = STATUS_MAP[contract.status] || STATUS_MAP.draft;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-medium">{contract.property_title}</p>
            <p className="text-sm text-gray-500">{contract.property_address}</p>
          </div>
          <Badge className={status.color}>{status.label}</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <p className="text-gray-500">月租</p>
            <p className="font-medium">HKD ${contract.monthly_rent?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">按金</p>
            <p className="font-medium">HKD ${contract.deposit?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">開始日期</p>
            <p>{contract.start_date ? format(new Date(contract.start_date), 'yyyy/MM/dd') : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">結束日期</p>
            <p>{contract.end_date ? format(new Date(contract.end_date), 'yyyy/MM/dd') : '—'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <Badge variant="outline">{isLandlord ? '業主' : '租客'}</Badge>
          {contract.contract_file_url && (
            <a href={contract.contract_file_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" />
                下載合約
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}