import React, { useState, useEffect } from 'react';
import { Plus, Flame, Check, Sparkles } from 'lucide-react';

export default function HabitsTab() {
  const [habits, setHabits] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10b981');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/habits');
      const result = await res.json();
      if (result.success) setHabits(result.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });
      const result = await res.json();
      if (result.success) {
        setName('');
        setIsModalOpen(false);
        fetchHabits();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLog = async (habitId: string, date: string) => {
    try {
      const res = await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, date }),
      });
      const result = await res.json();
      if (result.success) {
        setHabits(result.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá thói quen này?')) return;
    try {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  // Tính 7 ngày trong tuần dạng YYYY-MM-DD
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayDiff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(mondayDiff + idx);
      const tzoffset = d.getTimezoneOffset() * 60000;
      return (new Date(d.getTime() - tzoffset)).toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates();
  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const colors = [
    { value: '#10b981', label: 'Xanh lá' },
    { value: '#ef4444', label: 'Đỏ' },
    { value: '#3b82f6', label: 'Xanh dương' },
    { value: '#f59e0b', label: 'Vàng' },
    { value: '#ec4899', label: 'Hồng' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-300">Quản lý thói quen</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/35 transition-all flex items-center gap-1.5 focus:outline-none w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm thói quen</span>
        </button>
      </div>

      {/* Habits Checklist View */}
      {isLoading ? (
        <div className="text-center text-xs text-zinc-500 py-12 animate-pulse">Đang tải danh sách thói quen...</div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
          <Sparkles className="w-10 h-10 text-zinc-700 mb-2.5" />
          <p className="text-xs">Chưa có thói quen nào. Hãy rèn luyện thói quen tốt từ hôm nay!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700/60 transition-all group"
            >
              
              {/* Thói quen detail */}
              <div className="flex items-center justify-between sm:justify-start gap-4 min-w-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: `${habit.color}15` }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: habit.color }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{habit.name}</h4>
                    <div className="flex items-center gap-1 mt-0.5 text-zinc-500 text-[10px] font-semibold">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{habit.streak} ngày liên tiếp</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-400 font-semibold transition-opacity focus:outline-none ml-2"
                >
                  Xoá
                </button>
              </div>

              {/* Ma trận check-in hàng tuần */}
              <div className="flex items-center gap-4 justify-between sm:justify-end">
                {weekDates.map((dateStr, idx) => {
                  const isChecked = habit.logs.some((log: any) => log.date === dateStr);
                  return (
                    <div key={dateStr} className="flex flex-col items-center gap-1">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase">{dayNames[idx]}</span>
                      <button
                        onClick={() => handleToggleLog(habit.id, dateStr)}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all focus:outline-none ${
                          isChecked
                            ? 'text-white border-none shadow-lg'
                            : 'border-zinc-800 bg-zinc-950/40 text-transparent hover:border-zinc-700'
                        }`}
                        style={isChecked ? { backgroundColor: habit.color, boxShadow: `0 4px 12px ${habit.color}25` } : {}}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal thêm thói quen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md">
          <form
            onSubmit={handleCreateHabit}
            className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl"
          >
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Tạo thói quen mới</h3>
              <p className="text-[10px] text-zinc-500">Đặt lịch rèn luyện hàng ngày và xây dựng chuỗi ngày liên tiếp</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Tên thói quen</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên thói quen..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:border-purple-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Màu chủ đạo</label>
                <div className="flex gap-2.5">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        color === c.value
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-zinc-800 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs rounded-lg border border-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all"
              >
                Tạo thói quen
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
