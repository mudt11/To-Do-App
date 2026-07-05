import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Flame, Target, TrendingUp, Award } from 'lucide-react';

export default function StatsTab() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/stats');
        const result = await res.json();
        if (result.success) setStats(result.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-xs text-zinc-500 animate-pulse">Đang tải báo cáo thống kê...</span>
      </div>
    );
  }

  const { kpis, weeklyChartData, distribution, productivity } = stats;

  return (
    <div className="space-y-6">
      
      {/* KPIs Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-semibold uppercase">Đã hoàn thành</p>
            <h4 className="text-xl font-bold text-zinc-200">{kpis.completedTasks.count} / {kpis.totalTasks.count}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-semibold uppercase">Streak hiện tại</p>
            <h4 className="text-xl font-bold text-zinc-200">{productivity.currentStreak} ngày</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-semibold uppercase">Tốc độ hoàn thành</p>
            <h4 className="text-xl font-bold text-zinc-200">
              {kpis.totalTasks.count > 0 ? Math.round((kpis.completedTasks.count / kpis.totalTasks.count) * 100) : 0}%
            </h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-semibold uppercase">Kỷ lục streak</p>
            <h4 className="text-xl font-bold text-zinc-200">{productivity.recordStreak} ngày</h4>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Biểu đồ cột lớn */}
        <div className="lg:col-span-3 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-300">Biểu đồ công việc</h3>
            <p className="text-[10px] text-zinc-500">So sánh số lượng hoàn thành và tổng công việc được phân chia theo ngày trong tuần</p>
          </div>
          <div className="h-64 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }} />
                <Bar dataKey="Hoàn thành" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="Tổng công việc" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Donut lớn */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-300">Phân bổ loại hình</h3>
              <p className="text-[10px] text-zinc-500">Tỷ lệ công việc phân bổ theo dự án và các danh mục chính</p>
            </div>
            
            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-zinc-100">{kpis.totalTasks.count}</span>
                <span className="text-[8px] text-zinc-500 font-semibold uppercase">Tổng số</span>
              </div>
            </div>
          </div>

          {/* Legend Table */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-850">
            {distribution.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-[10px]">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-zinc-400 font-medium truncate">{entry.name}</span>
                <span className="text-zinc-200 font-bold ml-auto">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
