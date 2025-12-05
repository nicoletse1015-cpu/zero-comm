import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, Clock, Plus, Check, X, CalendarDays, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { toast } from 'sonner';

const STATUS_LABELS = {
  pending: { label: '待確認', bg: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '已確認', bg: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', bg: 'bg-gray-100 text-gray-600' },
  completed: { label: '已完成', bg: 'bg-blue-100 text-blue-800' }
};

function ViewingAppointmentPanel({ chatRoom, user }) {
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const fetchAppointments = async () => {
    if (!chatRoom?.id) return;
    setLoading(true);
    try {
      const data = await base44.entities.ViewingAppointment.filter({
        chat_room_id: String(chatRoom.id)
      });
      setAppointments(data || []);
    } catch (err) {
      console.error('載入預約失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [chatRoom?.id]);

  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('請選擇日期和時間');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.ViewingAppointment.create({
        chat_room_id: String(chatRoom.id),
        property_id: String(chatRoom.property_id),
        owner_id: String(chatRoom.owner_id),
        tenant_id: String(chatRoom.tenant_id),
        proposed_date: selectedDate,
        proposed_time: selectedTime,
        notes: notes || '',
        status: 'pending'
      });
      
      toast.success('預約已發送！');
      setShowForm(false);
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      fetchAppointments();
    } catch (err) {
      console.error('建立預約失敗:', err);
      toast.error('建立預約失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await base44.entities.ViewingAppointment.update(id, { status: newStatus });
      toast.success('已更新');
      fetchAppointments();
    } catch (err) {
      console.error('更新失敗:', err);
      toast.error('更新失敗');
    }
  };

  const activeAppointments = appointments.filter(a => a.status !== 'cancelled');
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="border-b bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-[#FF385C]" />
          <span className="text-sm font-semibold">預約睇樓</span>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(prev => !prev)}
          className="flex items-center gap-1 text-xs text-[#FF385C] hover:underline"
        >
          <Plus className="w-3 h-3" />
          新增預約
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-4 mb-3 shadow-sm">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">日期 *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                className="w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">時間 *</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">備註（可選）</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：希望看主人房"
              className="w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedDate('');
                setSelectedTime('');
                setNotes('');
              }}
              className="flex-1 h-10 border rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleCreateAppointment}
              disabled={!selectedDate || !selectedTime || submitting}
              className="flex-1 h-10 rounded-lg text-sm font-medium text-white bg-[#FF385C] hover:bg-[#E31C5F] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <React.Fragment>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  發送中...
                </React.Fragment>
              ) : (
                '發送預約'
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-3">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
        </div>
      ) : activeAppointments.length > 0 ? (
        <div className="space-y-2">
          {activeAppointments.map((apt) => {
            const statusInfo = STATUS_LABELS[apt.status] || STATUS_LABELS.pending;
            
            return (
              <div
                key={apt.id}
                className="flex items-center justify-between bg-white border rounded-lg p-3"
              >
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {format(new Date(apt.proposed_date), 'M月d日(EEE)', { locale: zhTW })}
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {apt.proposed_time}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bg}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {apt.status === 'pending' && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                      className="p-1.5 rounded hover:bg-green-50 text-green-600"
                      title="確認"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                      className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      title="取消"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {apt.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(apt.id, 'completed')}
                    className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                  >
                    標記完成
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-2">暫無預約，點擊上方新增</p>
      )}
    </div>
  );
}

export default ViewingAppointmentPanel;