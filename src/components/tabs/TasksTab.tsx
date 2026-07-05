import React, { useState, useEffect } from 'react';
import { Check, Star, Plus, Search } from 'lucide-react';

interface TasksTabProps {
  onAddTask: (parentId?: string | null) => void;
  onEditTask: (task: any) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onToggleStar: (id: string, currentStar: boolean) => void;
}

export default function TasksTab({ onAddTask, onEditTask, onToggleStatus, onToggleStar }: TasksTabProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState(''); // '', 'Cá nhân', 'Công việc', 'Học tập'
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, priorityFilter]);

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

  // Chia cột thời gian
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  // Lọc theo tag filter
  const filteredTasks = tasks.filter((task) => {
    if (!tagFilter) return true;
    return task.tags?.toLowerCase().includes(tagFilter.toLowerCase()) || 
           task.project?.name?.toLowerCase().includes(tagFilter.toLowerCase());
  });

  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');
  const activeTasks = filteredTasks.filter((t) => t.status !== 'Completed');

  // Hôm nay: task không có deadline hoặc có deadline hôm nay
  const todayTasks = activeTasks.filter((t) => {
    if (!t.deadline) return true;
    const d = new Date(t.deadline);
    return d < tomorrow;
  });

  // Ngày mai: task có deadline ngày mai trở đi
  const tomorrowTasks = activeTasks.filter((t) => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline);
    return d >= tomorrow;
  });

  const handleToggleDone = async (id: string, currentStatus: string) => {
    await onToggleStatus(id, currentStatus);
    fetchTasks();
  };

  const handleToggleFav = async (id: string, currentStar: boolean) => {
    await onToggleStar(id, currentStar);
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-600 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-300 focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="">Độ ưu tiên (Tất cả)</option>
            <option value="High">Cao</option>
            <option value="Medium">Trung bình</option>
            <option value="Low">Thấp</option>
          </select>

          <button
            onClick={() => onAddTask(null)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/35 transition-all flex items-center gap-1.5 focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm công việc</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto border-b border-zinc-850">
        {[
          { label: 'Tất cả', value: '' },
          { label: 'Cá nhân', value: 'Cá nhân' },
          { label: 'Công việc', value: 'Công việc' },
          { label: 'Học tập', value: 'Học tập' },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setTagFilter(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tagFilter === tab.value
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Hôm nay */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 px-1 uppercase tracking-wider flex items-center justify-between">
            <span>Hôm nay</span>
            <span className="w-5 h-5 rounded-full bg-zinc-900 text-zinc-500 text-[10px] flex items-center justify-center font-bold">
              {todayTasks.length}
            </span>
          </h3>
          <div className="space-y-3 min-h-[350px] p-3 rounded-2xl border border-zinc-850 bg-zinc-900/15">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-[11px]">
                Không có việc nào trong hôm nay
              </div>
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/20 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleDone(task.id, task.status)}
                        className="mt-0.5 w-4 h-4 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-white hover:border-purple-600 transition-colors"
                      >
                        <Check className="w-3 h-3 opacity-0 hover:opacity-100" />
                      </button>
                      <span
                        onClick={() => onEditTask(task)}
                        className="text-xs font-semibold text-zinc-200 cursor-pointer hover:text-purple-400 transition-all truncate"
                      >
                        {task.title}
                      </span>
                    </div>
                    <button onClick={() => handleToggleFav(task.id, task.isStarred)}>
                      <Star className={`w-3.5 h-3.5 ${task.isStarred ? 'text-amber-400 fill-current' : 'text-zinc-600 hover:text-zinc-400'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-850/50">
                    <div className="flex items-center gap-1.5">
                      {task.tags && (
                        <span className="text-[8px] px-1 rounded font-medium bg-purple-500/10 text-purple-400">
                          {task.tags.split(',')[0]}
                        </span>
                      )}
                      {task.project && (
                        <span className="text-[8px] px-1 rounded font-medium bg-blue-500/10 text-blue-400">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.deadline && (
                        <span className="text-[9px] text-zinc-500">
                          {new Date(task.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <span className={`text-[8px] px-1 rounded font-semibold ${getPriorityBadgeStyle(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Ngày mai */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 px-1 uppercase tracking-wider flex items-center justify-between">
            <span>Ngày mai & Sau đó</span>
            <span className="w-5 h-5 rounded-full bg-zinc-900 text-zinc-500 text-[10px] flex items-center justify-center font-bold">
              {tomorrowTasks.length}
            </span>
          </h3>
          <div className="space-y-3 min-h-[350px] p-3 rounded-2xl border border-zinc-850 bg-zinc-900/15">
            {tomorrowTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-[11px]">
                Chưa xếp việc cho những ngày tới
              </div>
            ) : (
              tomorrowTasks.map((task) => (
                <div key={task.id} className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/20 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleDone(task.id, task.status)}
                        className="mt-0.5 w-4 h-4 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-white hover:border-purple-600 transition-colors"
                      >
                        <Check className="w-3 h-3 opacity-0 hover:opacity-100" />
                      </button>
                      <span
                        onClick={() => onEditTask(task)}
                        className="text-xs font-semibold text-zinc-200 cursor-pointer hover:text-purple-400 transition-all truncate"
                      >
                        {task.title}
                      </span>
                    </div>
                    <button onClick={() => handleToggleFav(task.id, task.isStarred)}>
                      <Star className={`w-3.5 h-3.5 ${task.isStarred ? 'text-amber-400 fill-current' : 'text-zinc-600 hover:text-zinc-400'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-850/50">
                    <div className="flex items-center gap-1.5">
                      {task.tags && (
                        <span className="text-[8px] px-1 rounded font-medium bg-purple-500/10 text-purple-400">
                          {task.tags.split(',')[0]}
                        </span>
                      )}
                      {task.project && (
                        <span className="text-[8px] px-1 rounded font-medium bg-blue-500/10 text-blue-400">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.deadline && (
                        <span className="text-[9px] text-zinc-500">
                          {new Date(task.deadline).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' })}
                        </span>
                      )}
                      <span className={`text-[8px] px-1 rounded font-semibold ${getPriorityBadgeStyle(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Đã hoàn thành */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 px-1 uppercase tracking-wider flex items-center justify-between">
            <span>Đã hoàn thành</span>
            <span className="w-5 h-5 rounded-full bg-zinc-900 text-zinc-500 text-[10px] flex items-center justify-center font-bold">
              {completedTasks.length}
            </span>
          </h3>
          <div className="space-y-3 min-h-[350px] p-3 rounded-2xl border border-zinc-850 bg-zinc-900/15">
            {completedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-[11px]">
                Chưa hoàn thành công việc nào
              </div>
            ) : (
              completedTasks.map((task) => (
                <div key={task.id} className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/10 flex flex-col gap-2.5 opacity-60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleDone(task.id, task.status)}
                        className="mt-0.5 w-4 h-4 rounded border border-purple-600 bg-purple-600 flex items-center justify-center text-white"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>
                      <span
                        onClick={() => onEditTask(task)}
                        className="text-xs font-semibold text-zinc-400 line-through cursor-pointer hover:text-purple-400 transition-all truncate"
                      >
                        {task.title}
                      </span>
                    </div>
                    <button onClick={() => handleToggleFav(task.id, task.isStarred)}>
                      <Star className={`w-3.5 h-3.5 ${task.isStarred ? 'text-amber-400 fill-current' : 'text-zinc-650'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-850/50">
                    <div className="flex items-center gap-1.5">
                      {task.tags && (
                        <span className="text-[8px] px-1 rounded font-medium bg-zinc-800 text-zinc-500">
                          {task.tags.split(',')[0]}
                        </span>
                      )}
                      {task.project && (
                        <span className="text-[8px] px-1 rounded font-medium bg-zinc-800 text-zinc-500">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                    <span className={`text-[8px] px-1 rounded font-semibold ${getPriorityBadgeStyle(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
