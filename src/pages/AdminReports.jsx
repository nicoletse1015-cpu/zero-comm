import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Check, Eye, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ADMIN_EMAIL = "nicoletse1015@gmail.com";

const REASON_LABELS = {
  fake: '虛假放盤',
  scam: '懷疑詐騙',
  inappropriate: '不當內容',
  wrong_info: '資料不正確',
  duplicate: '重複放盤',
  other: '其他'
};

export default function AdminReports() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user.email !== ADMIN_EMAIL && user.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setCurrentUser(user);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list('-created_date', 200),
    enabled: !!currentUser
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, notes }) => {
      await base44.entities.Report.update(reportId, { status, admin_notes: notes });
      if (status === 'removed') {
        const report = reports.find(r => r.id === reportId);
        if (report) {
          try { await base44.entities.Property.delete(report.property_id); } catch (e) {}
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      setSelectedReport(null);
      setAdminNotes('');
      toast.success('已處理舉報');
    }
  });

  if (!currentUser || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const pendingReports = reports.filter(r => r.status === 'pending');
  const processedReports = reports.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold ml-2">舉報管理</h1>
          <Badge variant="secondary" className="ml-auto">{pendingReports.length} 待處理</Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="pending">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="pending" className="flex-1">待處理 ({pendingReports.length})</TabsTrigger>
            <TabsTrigger value="processed" className="flex-1">已處理 ({processedReports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingReports.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><Check className="w-12 h-12 text-green-500 mx-auto mb-4" /><p className="text-gray-500">暫無待處理的舉報</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {pendingReports.map(report => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive">{REASON_LABELS[report.reason] || report.reason}</Badge>
                            <span className="text-xs text-gray-500">{report.created_date && format(new Date(report.created_date), 'yyyy/MM/dd HH:mm')}</span>
                          </div>
                          <p className="text-sm text-gray-600">{report.details || '無詳細說明'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(createPageUrl('PropertyDetail') + `?id=${report.property_id}`, '_blank')}><Eye className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => setSelectedReport(report)}>處理</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="processed">
            <div className="space-y-3">
              {processedReports.map(report => (
                <Card key={report.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={report.status === 'removed' ? 'destructive' : 'secondary'}>{report.status === 'removed' ? '已移除' : '已駁回'}</Badge>
                      <span className="text-xs text-gray-500">{REASON_LABELS[report.reason]}</span>
                    </div>
                    {report.admin_notes && <p className="text-sm text-gray-500">備註：{report.admin_notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>處理舉報</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">舉報原因：<strong>{selectedReport && REASON_LABELS[selectedReport.reason]}</strong></p>
            <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="管理員備註（選填）" />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => updateReportMutation.mutate({ reportId: selectedReport.id, status: 'dismissed', notes: adminNotes })} disabled={updateReportMutation.isPending}>
              駁回舉報
            </Button>
            <Button variant="destructive" onClick={() => updateReportMutation.mutate({ reportId: selectedReport.id, status: 'removed', notes: adminNotes })} disabled={updateReportMutation.isPending}>
              {updateReportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-2" />移除房源</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}