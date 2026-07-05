import React from 'react';
import { Search, SlidersHorizontal, Inbox } from 'lucide-react';
import TaskCard from './TaskCard';
import { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onAddSubtask: (parentId: string) => void;
  
  // Bộ lọc
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function TaskList({
  tasks,
  onDelete,
  onToggleStatus,
  onEdit,
  onAddSubtask,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  searchQuery,
  setSearchQuery,
}: TaskListProps) {
  return (
    <div className="space-y-6">
      {/* Thanh lọc & tìm kiếm */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
        
        {/* Tìm kiếm */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm công việc..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-800 bg-zinc-950/40 text-sm text-zinc-200 placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Lọc */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Lọc theo:
          </div>

          {/* Lọc Trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="">Trạng thái (Tất cả)</option>
            <option value="Todo">Cần làm</option>
            <option value="InProgress">Đang làm</option>
            <option value="Completed">Đã xong</option>
          </select>

          {/* Lọc Độ ưu tiên */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="">Độ ưu tiên (Tất cả)</option>
            <option value="High">Cao</option>
            <option value="Medium">Trung bình</option>
            <option value="Low">Thấp</option>
          </select>
        </div>
      </div>

      {/* Danh sách Tasks */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-zinc-800/40 bg-zinc-900/10 border-dashed">
          <Inbox className="w-12 h-12 text-zinc-600 mb-3" />
          <h3 className="text-zinc-400 font-medium text-sm">Không tìm thấy công việc nào</h3>
          <p className="text-zinc-600 text-xs mt-1">Hãy thử đổi bộ lọc hoặc thêm công việc mới.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
