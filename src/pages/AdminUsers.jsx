import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ChevronLeft, Search, Trash2, Ban, Shield, 
  AlertTriangle, CheckCircle2, User, Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = "nicoletse1015@gmail.com";

export default function AdminUsers() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
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

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    enabled: !!currentUser
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, ban }) => {
      await base44.entities.User.update(userId, { 
        is_banned: ban, 
        banned_at: ban ? new Date().toISOString() : null 
      });
    },
    onSuccess: (_, { ban }) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success(ban ? '用戶已封禁' : '用戶已解封');
      setShowBanDialog(false);
      setSelectedUser(null);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const properties = await base44.entities.Property.filter({ owner_id: userId });
      for (const prop of properties) {
        await base44.entities.Property.delete(prop.id);
      }
      await base44.entities.User.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('用戶已刪除');
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  });

  if (!currentUser || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchQuery || 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'banned' && u.is_banned) ||
      (statusFilter === 'active' && !u.is_banned) ||
      (statusFilter === 'admin' && (u.role === 'admin' || u.email === ADMIN_EMAIL));
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">用戶管理</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <User className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-gray-500">總用戶</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin' || u.email === ADMIN_EMAIL).length}</p>
              <p className="text-xs text-gray-500">管理員</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Ban className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">{users.filter(u => u.is_banned).length}</p>
              <p className="text-xs text-gray-500">已封禁</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="搜尋用戶..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="active">正常</SelectItem>
              <SelectItem value="banned">已封禁</SelectItem>
              <SelectItem value="admin">管理員</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0 divide-y">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">沒有找到用戶</div>
            ) : (
              filteredUsers.map((u) => {
                const isAdmin = u.role === 'admin' || u.email === ADMIN_EMAIL;
                const isSelf = u.id === currentUser.id;
                
                return (
                  <div key={u.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn(u.is_banned ? "bg-red-100 text-red-600" : "bg-gray-100")}>
                          {(u.full_name || u.email || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{u.full_name || '未設定名稱'}</p>
                          {isAdmin && <Badge className="bg-blue-500 text-xs">管理員</Badge>}
                          {u.is_banned && <Badge className="bg-red-500 text-xs">已封禁</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-400">註冊於 {u.created_date ? format(new Date(u.created_date), 'yyyy/MM/dd') : '—'}</p>
                      </div>
                    </div>
                    
                    {!isSelf && !isAdmin && (
                      <div className="flex gap-2">
                        {u.is_banned ? (
                          <Button size="sm" variant="outline" onClick={() => banUserMutation.mutate({ userId: u.id, ban: false })} className="text-green-600 border-green-300">
                            <CheckCircle2 className="w-4 h-4 mr-1" />解封
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => { setSelectedUser(u); setShowBanDialog(true); }} className="text-orange-600 border-orange-300">
                            <Ban className="w-4 h-4 mr-1" />封禁
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => { setSelectedUser(u); setShowDeleteDialog(true); }} className="text-red-600 border-red-300">
                          <Trash2 className="w-4 h-4 mr-1" />刪除
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" />確認刪除用戶</DialogTitle>
              <DialogDescription>你確定要刪除用戶 <strong>{selectedUser?.email}</strong> 嗎？此操作無法復原。</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>取消</Button>
              <Button variant="destructive" onClick={() => deleteUserMutation.mutate(selectedUser?.id)} disabled={deleteUserMutation.isPending}>
                {deleteUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : '確認刪除'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600"><Ban className="w-5 h-5" />確認封禁用戶</DialogTitle>
              <DialogDescription>你確定要封禁用戶 <strong>{selectedUser?.email}</strong> 嗎？</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBanDialog(false)}>取消</Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => banUserMutation.mutate({ userId: selectedUser?.id, ban: true })} disabled={banUserMutation.isPending}>
                {banUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : '確認封禁'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}