import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

const HELP_CONTENT = {
  'listing': {
    title: '如何放盤？',
    content: `
## 免費放盤步驟

1. **登入帳戶** - 首先需要登入或註冊直居帳戶
2. **點擊「免費放盤」** - 在首頁或個人頁面找到放盤按鈕
3. **選擇放盤類型** - 選擇出租或出售
4. **填寫物業資料** - 包括地址、面積、價格等
5. **上傳相片** - 最少1張，最多20張
6. **確認並發布** - 檢查資料後點擊發布

## 注意事項
- 所有放盤需經過審核
- 相片需為物業實拍，不可使用網絡圖片
- 虛假放盤將刪除並封鎖帳戶
    `
  },
  'contact': {
    title: '如何聯絡業主？',
    content: `
## 聯絡業主步驟

1. **瀏覽房源** - 在搜尋頁面找到心儀房源
2. **查看詳情** - 點擊進入房源詳情頁
3. **點擊「聯絡業主」** - 即可開始對話
4. **直接溝通** - 與業主安排睇樓時間

## 安全提示
- 切勿在平台外進行交易
- 不要提前支付任何費用
- 建議雙方簽約前實地睇樓及查冊
    `
  },
  'commission': {
    title: '零佣金如何運作？',
    content: `
## 直居零佣金模式

### 傳統模式
- 租客支付半個月租金作佣金
- 業主支付半個月租金作佣金
- 總共一個月租金流向中介

### 直居模式
- 業主免費放盤
- 租客/買家免費聯絡
- 平台不收取任何佣金

### 我們如何營運？
- 會員訂閱制度
- 平價律師推薦
    `
  },
  'safety': {
    title: '安全交易指南',
    content: `
## 安全交易指南

### 睇樓安全
- 約在白天睇樓
- 告知家人朋友你的行程
- 首次睇樓可帶同朋友

### 交易安全
- 只在平台上溝通
- 查冊確認業權
- 比對業主身份證與查冊名字相同
- 到律師樓處理買賣合約/契約

### 付款安全
- 不要提前支付訂金
- 只使用銀行轉賬
- 保留所有收據
    `
  },
  'legal': {
    title: '免責聲明',
    content: `
## 免責聲明 Disclaimer

### 【中文】
本平台僅為物業租賃及買賣雙方提供資訊發布及初步撮合服務，並非地產代理，亦不持有地產代理牌照。本平台不參與任何租約或買賣合約之製作、修改、簽署或提交，所有法律文件均由雙方自行或透過執業律師處理，本平台概不承擔任何法律責任。

### 【English】
This platform only provides information posting and preliminary matching services for property leasing and sale. It is not an estate agent and does not hold an estate agent's licence. This platform does not participate in the preparation, amendment, execution or submission of any tenancy agreement or sale and purchase agreement. All legal documents shall be handled by the parties themselves or through practising solicitors. This platform shall not be liable for any legal responsibility.

## 租賃交易免責條款

### 【中文】重要聲明
- 本平台僅提供香港特區政府差餉物業估價署之官方空白租約表格下載連結，雙方須自行下載、填寫、修改（如需要）及親筆簽署。
- 租期不超過3年的住宅租約無需以契據（deed）形式簽署，雙方親筆簽名、繳交印花稅及提交CR109後即具完整法律效力。
- 租期超過3年的租賃必須以契據形式簽署並於土地註冊處登記，本平台不限制刊登，但所有文件必須離線由執業律師處理。
- 本平台不提供任何法律意見、不製作或修改租約、不代簽任何文件、不代交印花稅或CR109，所有責任由租賃雙方自行承擔。

### 【English】Important Disclaimer
- This platform only provides download links to the official blank tenancy agreement templates published by the Rating and Valuation Department of the HKSAR Government. Both parties must download, complete, amend (if necessary) and sign in person.
- For tenancies not exceeding 3 years, no deed is required. The tenancy will have full legal effect once signed by both parties, stamped, and Form CR109 is submitted.
- Leases exceeding 3 years must be executed as a deed and registered at the Land Registry. This platform does not restrict the posting of such listings, but all related documents must be handled offline by a practising solicitor.
- This platform does not provide legal advice, does not prepare or amend tenancy agreements, does not sign any documents on behalf of users, and does not submit stamp duty or Form CR109. All responsibilities lie with the landlord and tenant.

## 買賣交易免責條款

### 【中文】
香港住宅物業買賣必須由香港執業律師處理。本平台僅提供資訊發布、初步撮合及推薦執業律師服務，不參與任何臨時或正式買賣合約、轉讓契之起草、審閱或簽署，亦不處理訂金、印花稅或土地登記事宜。所有法律程序及責任由交易雙方及各自聘請的律師承擔。

### 【English】
The sale and purchase of residential properties in Hong Kong must be handled by Hong Kong practising solicitors. This platform only provides information posting, preliminary matching and referral services to practising solicitors. It does not participate in the drafting, review or execution of any provisional or formal agreement for sale and purchase or assignment, nor does it handle deposits, stamp duty or land registration. All legal procedures and responsibilities shall be borne by the parties and their respective solicitors.

## 私隱政策 Privacy Policy

### 【中文】
本平台僅收集撮合交易所需資料（電話、電郵、身份證資料、業權證明），純粹用於實名及業權驗證，絕不向第三方出售，身份證影像及業權證明文件將於驗證成功後立即永久刪除，僅保留「已驗證」狀態記錄。

### 【English】
This platform collects only the data necessary for transaction matching (phone number, email, HKID information, and proof of ownership) solely for identity and ownership verification purposes. No personal data will be sold to third parties. ID images and ownership documents are permanently deleted immediately upon successful verification; only a "verified" status is retained.
    `
  },
  'faq': {
    title: '其他常見問題',
    content: `
## 其他常見問題

### 直居收費嗎？
不收費。放盤、聯絡、成交全程免費。

### 如何驗證業主身分？
業主可透過上傳身分證、電話驗證、業權文件等方式提升驗證等級。

### 驗證徽章（信譽分級）
- **灰色**：未驗證（新上架）
- **藍色**：基本驗證（Email + 電話驗證）
- **綠色**：身份證驗證
- **彩色**：業權驗證

### 平台上的意向書有法律效力嗎？
沒有。訊息內建的意向書僅意向表達，正式合約須由律師處理。

### 可以放售盤嗎？
可以。直居支持出租和出售多種放盤類型。

### 發現虛假放盤怎麼辦？
請立即舉報，我們會盡快處理。
    `
  }
};

export default function HelpDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get('topic') || 'listing';
  const content = HELP_CONTENT[topic] || HELP_CONTENT['listing'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Help')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">{content.title}</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6 prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ 
              __html: content.content
                .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-6 mb-3">$1</h2>')
                .replace(/^### (.+)$/gm, '<h3 class="font-semibold mt-4 mb-2">$1</h3>')
                .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '<br/><br/>')
            }} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}