import React, { useEffect, useState } from 'react';
import { Check, Star, Play, CheckCircle2, AlertTriangle, Calendar, Flame, Plus, Bot } from 'lucide-react';
import { Task } from '@prisma/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OverviewTabProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onToggleStar: (id: string, currentStar: boolean) => void;
  onNavigateToAI: () => void;
}

export interface StatsData {
  kpis: {
    totalTasks: { count: number; change: string };
    completedTasks: { count: number; change: string };
    inProgressTasks: { count: number; change: string };
    overdueTasks: { count: number; change: string };
  };
  weeklyChartData: { name: string; 'Tổng công việc': number; 'Hoàn thành': number }[];
  distribution: { name: string; value: number; color: string }[];
  productivity: {
    currentStreak: number;
    recordStreak: number;
  };
}

export default function OverviewTab({ onAddTask, onEditTask, onToggleStatus, onToggleStar, onNavigateToAI }: OverviewTabProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tính 7 ngày trong tuần hiện tại
  const getDaysOfCurrentWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0: CN, 1: T2, ...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const days = [];
    const names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + distanceToMonday + i);
      const isToday = d.toDateString() === today.toDateString();
      days.push({
        name: names[i],
        num: String(d.getDate()).padStart(2, '0'),
        active: isToday
      });
    }
    return days;
  };

  const daysOfWeek = getDaysOfCurrentWeek();

  // Xác định màu sắc nhãn dán cho timeline
  const getTagColor = (tags: string | null) => {
    const firstTag = tags ? tags.split(',')[0] : 'Khác';
    switch (firstTag) {
      case 'Cá nhân': return 'border-blue-500 bg-blue-500/5 text-blue-400';
      case 'Công việc': return 'border-emerald-500 bg-emerald-500/5 text-emerald-400';
      case 'Học tập': return 'border-purple-500 bg-purple-500/5 text-purple-400';
      case 'Thói quen': return 'border-amber-500 bg-amber-500/5 text-amber-400';
      default: return 'border-zinc-700 bg-zinc-900/10 text-zinc-400';
    }
  };

  // Tạo timelineEvents động dựa trên todayTasks thực tế
  const dynamicTimelineEvents = todayTasks
    .filter(t => t.deadline)
    .map(t => {
      const d = new Date(t.deadline!);
      return {
        time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        title: t.title,
        tag: t.tags ? t.tags.split(',')[0] : 'Khác',
        color: getTagColor(t.tags)
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const loadData = async () => {
    try {
      setIsLoading(true);
      const statsRes = await fetch('/api/stats');
      const statsResult = await statsRes.json();
      if (statsResult.success) setStats(statsResult.data);

      const tasksRes = await fetch('/api/tasks');
      const tasksResult = await tasksRes.json();
      if (tasksResult.success) {
        setTodayTasks(tasksResult.data.slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-xs text-zinc-500 animate-pulse">Đang tải dữ liệu Dashboard...</span>
      </div>
    );
  }

  const { kpis, weeklyChartData, distribution, productivity } = stats;

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Low': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/25';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'High': return 'Cao';
      case 'Medium': return 'Trung bình';
      case 'Low': return 'Thấp';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-medium">Tổng công việc</p>
            <h3 className="text-2xl font-bold text-zinc-100">{kpis.totalTasks.count}</h3>
            <span className="text-[9px] text-emerald-400 font-medium">{kpis.totalTasks.change} <span className="text-zinc-600">so với tuần trước</span></span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-medium">Hoàn thành</p>
            <h3 className="text-2xl font-bold text-zinc-100">{kpis.completedTasks.count}</h3>
            <span className="text-[9px] text-emerald-400 font-medium">{kpis.completedTasks.change} <span className="text-zinc-600">so với tuần trước</span></span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-medium">Đang làm</p>
            <h3 className="text-2xl font-bold text-zinc-100">{kpis.inProgressTasks.count}</h3>
            <span className="text-[9px] text-emerald-400 font-medium">{kpis.inProgressTasks.change} <span className="text-zinc-600">so với tuần trước</span></span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Play className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-medium">Quá hạn</p>
            <h3 className="text-2xl font-bold text-zinc-100">{kpis.overdueTasks.count}</h3>
            <span className="text-[9px] text-red-400 font-medium">{kpis.overdueTasks.change} <span className="text-zinc-600">so với tuần trước</span></span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Tasks & Today Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Cột trái: Công việc hôm nay (3/5 width) */}
        <div className="lg:col-span-3 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-300">Công việc hôm nay</h3>
          </div>

          <div className="flex-1 space-y-2.5">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <p className="text-xs">Không có công việc nào cần làm hôm nay.</p>
              </div>
            ) : (
              todayTasks.map((task: Task) => {
                const isCompleted = task.status === 'Completed';
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/20 hover:border-zinc-700/60 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onToggleStatus(task.id, task.status)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-zinc-700 bg-zinc-900/40 hover:border-purple-500'
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <span
                          onClick={() => onEditTask(task)}
                          className={`text-xs font-medium cursor-pointer transition-all ${
                            isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200 hover:text-purple-400'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.tags && (
                          <span className="ml-2.5 text-[9px] px-1.5 py-0.5 rounded font-medium bg-purple-500/10 text-purple-400">
                            {task.tags.split(',')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {task.deadline && (
                        <span className="text-[10px] text-zinc-500">
                          {new Date(task.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${getPriorityBadgeStyle(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                      <button
                        onClick={() => onToggleStar(task.id, task.isStarred)}
                        className={`p-1 rounded transition-colors ${task.isStarred ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={onAddTask}
            className="w-fit text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 mt-2 focus:outline-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm công việc mới</span>
          </button>
        </div>

        {/* Cột phải: Lịch hôm nay (2/5 width) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-300">Lịch hôm nay</h3>
            <span className="text-[9px] text-zinc-500 font-medium">Tháng 7, 2026</span>
          </div>

          {/* Timeline Days */}
          <div className="grid grid-cols-7 gap-1 border-b border-zinc-850 pb-3">
            {daysOfWeek.map((day) => (
              <div key={day.name} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-500 font-medium">{day.name}</span>
                <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                  day.active
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:bg-zinc-800/40 cursor-pointer'
                }`}>
                  {day.num}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Hours */}
          <div className="space-y-3.5 overflow-y-auto max-h-[220px] pr-1.5">
            {dynamicTimelineEvents.length === 0 ? (
              <div className="text-center text-zinc-500 text-xs py-10">
                Không có lịch trình nào cho hôm nay.
              </div>
            ) : (
              dynamicTimelineEvents.map((evt, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-[9px] text-zinc-500 w-8 font-medium mt-1">{evt.time}</span>
                  <div className={`flex-1 p-2 rounded-xl border-l-2 border ${evt.color} flex items-center justify-between`}>
                    <span className="text-[10px] font-medium truncate max-w-[70%]">{evt.title}</span>
                    <span className="text-[8px] opacity-75 font-semibold px-1 rounded">{evt.tag}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Charts & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Biểu đồ cột hiệu suất tuần (2/5 width) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col space-y-4">
          <h3 className="text-xs font-semibold text-zinc-300">Thống kê tuần này</h3>
          <div className="h-44 w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }} />
                <Bar dataKey="Hoàn thành" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tổng công việc" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn phân bổ dự án (2/5 width) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col space-y-4">
          <h3 className="text-xs font-semibold text-zinc-300">Phân bổ theo dự án</h3>
          <div className="h-44 w-full flex items-center gap-4">
            <div className="w-1/2 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distribution.map((entry: { name: string; value: number; color: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Text in Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-zinc-100">{kpis.totalTasks.count}</span>
                <span className="text-[8px] text-zinc-500 font-semibold uppercase">Tổng</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="w-1/2 space-y-2">
              {distribution.map((entry: { name: string; value: number; color: string }, index: number) => (
                <div key={index} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-zinc-400 truncate font-medium">{entry.name}</span>
                  </div>
                  <span className="text-zinc-200 font-semibold ml-2">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Năng suất Streak (1/5 width) */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300">Năng suất</h3>
            <div>
              <p className="text-[10px] text-zinc-500 font-medium">Chuỗi ngày hoàn thành</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-zinc-100">{productivity.currentStreak}</span>
                <span className="text-xs text-zinc-400">ngày</span>
                <Flame className="w-5 h-5 text-amber-500 animate-pulse ml-1" />
              </div>
              <p className="text-[9px] text-zinc-500 font-medium mt-1">Kỷ lục: {productivity.recordStreak} ngày ⚡</p>
            </div>
          </div>

          {/* Bảng check thói quen các ngày trong tuần */}
          <div className="flex items-center justify-between gap-1.5 pt-4 border-t border-zinc-850">
            {daysOfWeek.map((day, idx) => (
              <div key={day.name} className="flex flex-col items-center gap-1">
                <span className="text-[8px] text-zinc-500 font-bold">{day.name}</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                  idx < 5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/40 text-zinc-600'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating AI Button */}
      <button
        onClick={onNavigateToAI}
        className="fixed bottom-20 lg:bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all animate-bounce z-40 group flex items-center gap-2 focus:outline-none"
      >
        <Bot className="w-5 h-5" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out text-xs font-semibold whitespace-nowrap">
          Hỏi Trợ lý AI
        </span>
      </button>
    </div>
  );
}
