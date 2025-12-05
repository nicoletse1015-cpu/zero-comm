import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, AlertTriangle, Clock, Building2, Scale, 
  ExternalLink, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function RentalLegalNotice({ onAllChecked }) {
  const [checked, setChecked] = useState({
    stampDuty: false,
    cr109: false,
    tenancy: false,
    platform: false,
    process: false
  });

  const allChecked = Object.values(checked).every(Boolean);
  
  React.useEffect(() => {
    onAllChecked?.(allChecked);
  }, [allChecked, onAllChecked]);

  const handleCheck = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Scale className="w-12 h-12 mx-auto text-[#FF385C] mb-3" />
        <h2 className="text-2xl font-bold">租賃法律須知</h2>
        <p className="text-gray-500 mt-1">請仔細閱讀以下重要資訊</p>
      </div>

      {/* 印花稅提醒 */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-2">印花稅提醒</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                根據《印花稅條例》，所有租約必須於簽署後 <strong>30 日內</strong>繳納印花稅，否則最高可罰 <strong>10 倍稅款</strong>。通常由業主與租客各付一半。
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                checked={checked.stampDuty} 
                onCheckedChange={() => handleCheck('stampDuty')}
              />
              <span className="text-sm text-amber-800">我已閱讀並明白</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* CR109 提交義務 */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 mb-2">CR109 提交義務</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                業主必須於租約開始後 <strong>1 個月內</strong>向差餉物業估價署提交 CR109 表格，否則將無法合法追收租金或收樓。
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                checked={checked.cr109} 
                onCheckedChange={() => handleCheck('cr109')}
              />
              <span className="text-sm text-blue-800">我已閱讀並明白</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 租期長短的法律要求 */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-3">租期長短的法律要求</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium text-green-800 text-sm mb-1">
                    租期不超過 3 年的普通租約（Tenancy Agreement）
                  </p>
                  <p className="text-sm text-green-700">
                    只需要雙方親筆簽名 + 繳印花稅 + 提交 CR109，即具完整法律效力
                  </p>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="font-medium text-orange-800 text-sm mb-1">
                    租期超過 3 年的租賃（Lease）
                  </p>
                  <p className="text-sm text-orange-700">
                    必須以契據（Deed）形式由律師見證、加蓋紅印並土地註冊處登記。本平台不限制刊登，但所有文件必須離線由執業律師處理。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                checked={checked.tenancy} 
                onCheckedChange={() => handleCheck('tenancy')}
              />
              <span className="text-sm">我已閱讀並明白</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 直居平台聲明 */}
      <Card className="border-[#FF385C]/30 bg-[#FF385C]/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-[#FF385C] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-[#FF385C] mb-3">直居平台聲明</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF385C]">•</span>
                  直居僅提供業主與租客直接溝通渠道
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF385C]">•</span>
                  僅提供政府官方空白租約表格下載連結及教學指引，不參與租約製作、不代簽、不代交稅項、不提供法律意見
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF385C]">•</span>
                  平台上的意向書不具法律約束力
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF385C]">•</span>
                  直居不參與任何代理行為，毋須持有地產代理牌照
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF385C]">•</span>
                  建議雙方簽約前實地視察及查冊
                </li>
              </ul>
              <div className="mt-3 p-2 bg-white rounded-lg">
                <p className="text-xs text-gray-500">
                  如有法律疑問，請諮詢執業律師
                  <a 
                    href="https://www.hklawsoc.org.hk" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#FF385C] ml-1 inline-flex items-center gap-1 hover:underline"
                  >
                    香港律師會名冊 <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#FF385C]/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                checked={checked.platform} 
                onCheckedChange={() => handleCheck('platform')}
              />
              <span className="text-sm">我已閱讀並明白</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 租賃交易流程 */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          租賃交易流程（3 個簡單步驟）
        </h3>
        
        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          <p className="text-center text-sm text-gray-600">
            談好價錢 <ArrowRight className="w-4 h-4 inline mx-1" /> 
            互相傳送意向書 <ArrowRight className="w-4 h-4 inline mx-1" /> 
            雙方自行完成以下 3 步
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF385C] text-white flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">下載差餉物業估價署官方標準租約空白表格</h4>
                  <p className="text-sm text-gray-500 mb-3">可自行增刪條款，列印 → 填寫 → 雙方親筆簽名即可</p>
                  <div className="flex flex-wrap gap-2">
                    <a 
                      href="https://www.rvd.gov.hk/doc/tc/SDU_tenancy_agreement_template.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 inline-flex items-center gap-1"
                    >
                      中文版 <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href="https://www.rvd.gov.hk/doc/en/SDU_tenancy_agreement_template.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 inline-flex items-center gap-1"
                    >
                      英文版 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF385C] text-white flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">自行網上繳交印花稅</h4>
                  <p className="text-sm text-gray-500 mb-3">稅務局官方連結</p>
                  <a 
                    href="https://btp.etax.ird.gov.hk/fe/pw/reg/btp/btppstmenu" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 inline-flex items-center gap-1"
                  >
                    前往繳稅 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF385C] text-white flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">自行網上提交 CR109 表格</h4>
                  <p className="text-sm text-gray-500 mb-3">差餉物業估價署官方連結</p>
                  <a 
                    href="https://eform1.rvd.gov.hk/eform/apps/CR109/step1?language=zh" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 inline-flex items-center gap-1"
                  >
                    前往提交 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 pt-3 border-t">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              checked={checked.process} 
              onCheckedChange={() => handleCheck('process')}
            />
            <span className="text-sm">我已閱讀並明白以上交易流程</span>
          </label>
        </div>
      </div>
    </div>
  );
}