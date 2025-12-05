import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, ShieldBan, Crown, Lock, UserX
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function BlockedUsers() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  // Fetch blocked users
  const { data: blockedUsers = [], isLoading } = useQuery({
    queryKey: ['blockedUsers', user?.id],
    queryFn: () => base44.entities.BlockedUser.filter({ blocker_id: String(user?.id) }, '-created_date'),
    enabled: !!user?.id
  });

  const isPremium = user?.is_premium && user?.premium_expires_at && new Date(user.premium_expires_at) > new Date();

  // Unblock mutation
  const unblockMutation = useMutation({
    mutationFn: async (blockId) => {
      await base44.entities.BlockedUser.delete(blockId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blockedUsers']);
      toast.success('已解除封鎖');
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link to={createPageUrl('Profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold ml-2">封鎖用戶</h1>
          <Badge className="ml-2 bg-amber-400 text-amber-900">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {!isPremium ? (
          /* Non-Premium Lock Screen */
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Premium 專屬功能</h2>
              <p className="text-gray-500 mb-6">
                升級 Premium 即可封鎖騷擾或不良用戶
              </p>
              <Link to={createPageUrl('Premium')}>
                <Button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  升級 Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 divide-y">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF385C] mx-auto"></div>
                </div>
              ) : blockedUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <ShieldBan className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">沒有封鎖的用戶</p>
                  <p className="text-sm text-gray-400 mt-1">你可以在聊天室中封鎖不良用戶</p>
                </div>
              ) : (
                blockedUsers.map((blocked) => (
                  <div key={blocked.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gray-400 text-white">
                          {(blocked.blocked_name || 'U')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{blocked.blocked_name || '用戶'}</p>
                        <p className="text-sm text-gray-500">
                          {blocked.reason || '無原因'} · {format(new Date(blocked.created_date), 'yyyy/MM/dd')}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => unblockMutation.mutate(blocked.id)}
                      disabled={unblockMutation.isPending}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      解除封鎖
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}