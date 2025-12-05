import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, Send, Image as ImageIcon, FileText, 
  MoreVertical, Phone, Video, Info, Paperclip, File, PenLine,
  Trash2, ShieldBan, Crown
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import MarkAsCompletedBanner from '@/components/chat/MarkAsCompletedBanner';
import ViewingAppointmentPanel from '@/components/chat/ViewingAppointmentPanel';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState('');
  const [isMobileListView, setIsMobileListView] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const roomIdFromUrl = urlParams.get('roomId');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  // Fetch chat rooms
  const { data: chatRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['chatRooms', user?.id],
    queryFn: async () => {
      const asOwner = await base44.entities.ChatRoom.filter({ owner_id: String(user?.id) });
      const asTenant = await base44.entities.ChatRoom.filter({ tenant_id: String(user?.id) });
      return [...asOwner, ...asTenant].sort((a, b) => 
        new Date(b.last_message_time || b.created_date) - new Date(a.last_message_time || a.created_date)
      );
    },
    enabled: !!user?.id
  });

  // Auto-select room from URL
  useEffect(() => {
    if (roomIdFromUrl && chatRooms.length > 0) {
      const room = chatRooms.find(r => r.id === roomIdFromUrl);
      if (room) {
        setSelectedRoom(room);
        setIsMobileListView(false);
      }
    }
  }, [roomIdFromUrl, chatRooms]);

  // Fetch messages for selected room
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedRoom?.id],
    queryFn: () => base44.entities.Message.filter(
      { chat_room_id: selectedRoom?.id },
      'created_date',
      100
    ),
    enabled: !!selectedRoom?.id,
    refetchInterval: 3000
  });

  // Fetch property details for selected room
  const { data: propertyData } = useQuery({
    queryKey: ['property', selectedRoom?.property_id],
    queryFn: async () => {
      const results = await base44.entities.Property.filter({ id: selectedRoom?.property_id });
      return results[0] || null;
    },
    enabled: !!selectedRoom?.property_id
  });

  // Check if both parties have sent intent letters
  const hasMutualIntentLetters = React.useMemo(() => {
    if (!messages || !user || !selectedRoom) return false;
    
    const intentLetters = messages.filter(m => m.message_type === 'intent_letter');
    const ownerSentIntent = intentLetters.some(m => m.sender_id === selectedRoom.owner_id);
    const tenantSentIntent = intentLetters.some(m => m.sender_id === selectedRoom.tenant_id);
    
    return ownerSentIntent && tenantSentIntent;
  }, [messages, user, selectedRoom]);

  // Check if current user is the owner
  const isOwner = user && selectedRoom && user.id === selectedRoom.owner_id;

  // Check if user is premium
  const isPremium = user?.is_premium && user?.premium_expires_at && new Date(user.premium_expires_at) > new Date();

  // Get other party info
  const otherPartyId = selectedRoom ? (isOwner ? selectedRoom.tenant_id : selectedRoom.owner_id) : null;
  const otherPartyName = selectedRoom ? (isOwner ? selectedRoom.tenant_name : selectedRoom.owner_name) : '';

  // Delete chat room mutation (Premium only)
  const deleteChatRoomMutation = useMutation({
    mutationFn: async () => {
      // Delete all messages in the room first
      const roomMessages = await base44.entities.Message.filter({ chat_room_id: selectedRoom.id });
      for (const msg of roomMessages) {
        await base44.entities.Message.delete(msg.id);
      }
      // Delete the chat room
      await base44.entities.ChatRoom.delete(selectedRoom.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chatRooms']);
      setSelectedRoom(null);
      setIsMobileListView(true);
      toast.success('聊天室已刪除');
    }
  });

  // Block user mutation (Premium only)
  const blockUserMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.BlockedUser.create({
        blocker_id: String(user.id),
        blocked_id: String(otherPartyId),
        blocked_name: otherPartyName,
        reason: '從聊天室封鎖'
      });
    },
    onSuccess: () => {
      toast.success(`已封鎖 ${otherPartyName}`);
      setShowBlockDialog(false);
    }
  });

  // Mark property as completed mutation
  const markCompletedMutation = useMutation({
    mutationFn: async () => {
      const newStatus = propertyData?.listing_type === 'rent' ? 'rented' : 'sold';
      await base44.entities.Property.update(selectedRoom.property_id, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['property', selectedRoom?.property_id]);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, type = 'text', fileUrl = null }) => {
      await base44.entities.Message.create({
        chat_room_id: String(selectedRoom.id),
        sender_id: String(user.id),
        sender_name: user.full_name || user.email,
        content,
        message_type: type,
        file_url: fileUrl
      });
      await base44.entities.ChatRoom.update(selectedRoom.id, {
        last_message: type === 'text' ? content : `[${type === 'pdf' ? '文件' : type === 'intent_letter' ? '意向書' : '圖片'}]`,
        last_message_time: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', selectedRoom?.id]);
      queryClient.invalidateQueries(['chatRooms']);
      setMessage('');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const result = await base44.integrations.Core.UploadFile({ file });
    if (result.file_url) {
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      sendMessageMutation.mutate({
        content: file.name,
        type: isPdf ? 'pdf' : isImage ? 'image' : 'text',
        fileUrl: result.file_url
      });
    }
  };

  const sendIntentLetter = () => {
    if (!propertyData || !selectedRoom || !user) return;
    
    const isRentListing = propertyData?.listing_type === 'rent';
    const iAmOwner = String(user?.id) === String(selectedRoom?.owner_id);
    
    let letter;
    
    if (isRentListing) {
      // 租賃意向書
      if (iAmOwner) {
        letter = `
租賃意向書（業主）

致：${selectedRoom.tenant_name}

本人 ${user.full_name || user.email} 作為 ${selectedRoom.property_title} 之業主，有意將上述物業出租予閣下。

此意向書僅表達出租意願，不具有法律約束力。正式租約須雙方親筆簽名、繳納印花稅及提交 CR109 表格。

日期：${new Date().toLocaleDateString('zh-HK')}
        `.trim();
      } else {
        letter = `
租賃意向書（租客）

致：${selectedRoom.owner_name}

本人 ${user.full_name || user.email} 有意承租 ${selectedRoom.property_title}。

此意向書僅表達承租意願，不具有法律約束力。正式租約須雙方親筆簽名、繳納印花稅及提交 CR109 表格。

日期：${new Date().toLocaleDateString('zh-HK')}
        `.trim();
      }
    } else {
      // 買賣意向書
      if (iAmOwner) {
        letter = `
買賣意向書（業主）

致：${selectedRoom.tenant_name}

本人 ${user.full_name || user.email} 作為 ${selectedRoom.property_title} 之業主，有意將上述物業出售予閣下。

此意向書僅表達出售意願，不具有法律約束力。所有買賣合約、轉讓契及印花稅等須由執業律師處理。

日期：${new Date().toLocaleDateString('zh-HK')}
        `.trim();
      } else {
        letter = `
買賣意向書（買家）

致：${selectedRoom.owner_name}

本人 ${user.full_name || user.email} 有意購買 ${selectedRoom.property_title}。

此意向書僅表達購買意願，不具有法律約束力。所有買賣合約、轉讓契及印花稅等須由執業律師處理。

日期：${new Date().toLocaleDateString('zh-HK')}
        `.trim();
      }
    }
    
    sendMessageMutation.mutate({
      content: letter,
      type: 'intent_letter'
    });
  };

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherPartyName = (room) => {
    if (!user) return '';
    return room.owner_id === user.id ? room.tenant_name : room.owner_name;
  };

  const isMyMessage = (msg) => msg.sender_id === user?.id;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Chat List - Left Panel */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 border-r flex flex-col",
        !isMobileListView && "hidden md:flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">訊息</h1>
            <div className="w-9" />
          </div>
        </div>

        {/* Room List */}
        <ScrollArea className="flex-1">
          {roomsLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">暫無訊息</p>
              <p className="text-sm text-gray-400 mt-1">開始聯絡業主開展對話</p>
            </div>
          ) : (
            <div className="divide-y">
              {chatRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsMobileListView(false);
                  }}
                  className={cn(
                    "w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left",
                    selectedRoom?.id === room.id && "bg-gray-50"
                  )}
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarFallback className="bg-[#FF385C] text-white">
                      {(getOtherPartyName(room) || 'U')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold truncate">{getOtherPartyName(room)}</p>
                      {room.last_message_time && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {format(new Date(room.last_message_time), 'MM/dd')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{room.property_title}</p>
                    {room.last_message && (
                      <p className="text-sm text-gray-400 truncate mt-0.5">{room.last_message}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Window - Right Panel */}
      <div className={cn(
        "flex-1 flex flex-col",
        isMobileListView && "hidden md:flex"
      )}>
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileListView(true)}
                  className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#FF385C] text-white">
                    {(getOtherPartyName(selectedRoom) || 'U')[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{getOtherPartyName(selectedRoom)}</p>
                  <p className="text-xs text-gray-500">{selectedRoom.property_title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link 
                  to={createPageUrl('PropertyDetail') + `?id=${selectedRoom.property_id}`}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Info className="w-5 h-5 text-gray-600" />
                </Link>
                
                {/* Premium Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => isPremium ? setShowDeleteDialog(true) : toast.error('此功能需要 Premium 會員')}
                      className={!isPremium ? 'opacity-50' : ''}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      刪除聊天室
                      {!isPremium && <Crown className="w-3 h-3 ml-2 text-amber-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => isPremium ? setShowBlockDialog(true) : toast.error('此功能需要 Premium 會員')}
                      className={!isPremium ? 'opacity-50' : 'text-red-600'}
                    >
                      <ShieldBan className="w-4 h-4 mr-2" />
                      封鎖用戶
                      {!isPremium && <Crown className="w-3 h-3 ml-2 text-amber-500" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Viewing Appointment Panel */}
            <ViewingAppointmentPanel 
              chatRoom={selectedRoom} 
              user={user} 
              property={propertyData} 
            />

            {/* Mark as Completed Banner */}
            {hasMutualIntentLetters && isOwner && propertyData?.status === 'active' && (
              <MarkAsCompletedBanner
                listingType={propertyData?.listing_type}
                onMarkCompleted={() => markCompletedMutation.mutate()}
                isLoading={markCompletedMutation.isPending}
              />
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Property Card */}
                <Link 
                  to={createPageUrl('PropertyDetail') + `?id=${selectedRoom.property_id}`}
                  className="block p-3 bg-gray-50 rounded-xl border hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                      業主直讓
                    </Badge>
                  </div>
                  <p className="font-medium">{selectedRoom.property_title}</p>
                  <p className="text-sm text-gray-500">點擊查看房源詳情</p>
                </Link>

                {/* Legal Notice */}
                <div className="text-center py-2">
                  <p className="text-xs text-gray-400 bg-gray-50 inline-block px-3 py-1 rounded-full">
                    請勿在平台外交易，所有意向書均不具法律效力
                  </p>
                </div>

                {/* Messages */}
                {messages.map((msg, idx) => {
                  const isMine = isMyMessage(msg);
                  const showAvatar = idx === 0 || messages[idx - 1]?.sender_id !== msg.sender_id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        isMine ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMine && showAvatar && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs bg-gray-200">
                            {(msg.sender_name || 'U')[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {!isMine && !showAvatar && <div className="w-8" />}
                      
                      <div className={cn(
                        "max-w-[70%] px-4 py-2 rounded-2xl",
                        isMine 
                          ? "bg-[#FF385C] text-white rounded-br-md" 
                          : "bg-gray-100 text-gray-900 rounded-bl-md",
                        msg.message_type === 'intent_letter' && "border-2 border-amber-400 bg-amber-50 text-gray-900"
                      )}>
                        {msg.message_type === 'intent_letter' && (
                          <div className="flex items-center gap-1 mb-1 text-amber-600">
                            <PenLine className="w-3 h-3" />
                            <span className="text-xs font-medium">意向書</span>
                          </div>
                        )}
                        {msg.message_type === 'pdf' && msg.file_url ? (
                          <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <File className="w-5 h-5" />
                            <span className="text-sm underline">{msg.content}</span>
                          </a>
                        ) : msg.message_type === 'image' && msg.file_url ? (
                          <img src={msg.file_url} alt="" className="max-w-full rounded-lg" />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                        <p className={cn(
                          "text-xs mt-1",
                          isMine && msg.message_type !== 'intent_letter' ? "text-white/70" : "text-gray-400"
                        )}>
                          {format(new Date(msg.created_date), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => document.getElementById('file-upload').click()}>
                      <File className="w-4 h-4 mr-2" />
                      上傳文件
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={sendIntentLetter}>
                      <PenLine className="w-4 h-4 mr-2" />
                      {propertyData?.listing_type === 'rent' ? '發送租賃意向書' : '發送買賣意向書'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="輸入訊息..."
                  className="flex-1 rounded-full border-gray-200"
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="rounded-full bg-[#FF385C] hover:bg-[#E31C5F] px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">你的訊息</h2>
              <p className="text-gray-500 max-w-sm">
                選擇一個對話開始聊天，或瀏覽房源後聯絡業主
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Chat Room Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>刪除聊天室</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除此聊天室嗎？所有對話記錄將被永久刪除，此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteChatRoomMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block User Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>封鎖用戶</AlertDialogTitle>
            <AlertDialogDescription>
              確定要封鎖 {otherPartyName} 嗎？封鎖後對方將無法向你發送訊息。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => blockUserMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              封鎖
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}