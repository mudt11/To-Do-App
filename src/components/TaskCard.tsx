import React, { useState } from 'react';
import { Calendar, Trash2, Edit3, Plus, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onAddSubtask: (parentId: string) => void;
}

export default function TaskCard({ task, onDelete, onToggleStatus, onEdit, onAddSubtask }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSubtask = !!task.parentId;
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  // Format ngày deadline thân thiện
  const formatDeadline = (dateStr: Date | string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Kiểm tra xem deadline đã quá hạn chưa
  const isOverdue = (dateStr: Date | string | null, status: string) => {
    if (!dateStr || status === 'Completed') return false;
    return new Date(dateStr) < new Date();
  };

  // Màu sắc cho từng mức độ ưu tiên
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Low':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
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

  const isCompleted = task.status === 'Completed';

  return (
    <div className={`group relative transition-all duration-300 rounded-2xl border bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-900/60 ${
      isCompleted ? 'border-zinc-800/50 opacity-60' : 'border-zinc-800/80 hover:border-zinc-700/80'
    } ${isSubtask ? 'ml-8 md:ml-12 mt-2 border-l-2 border-l-purple-500/40' : 'p-5 mb-4'}`}>
      
      <div className={`flex items-start justify-between gap-4 ${isSubtask ? 'p-3' : ''}`}>
        
        {/* Checkbox & Tiêu đề, mô tả */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggleStatus(task.id, task.status)}
            className="mt-1 text-zinc-400 hover:text-emerald-400 transition-colors focus:outline-none flex-shrink-0"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {/* Tiêu đề */}
              <h3 className={`text-base font-medium truncate ${
                isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
              }`}>
                {task.title}
              </h3>
              
              {/* Priority Badge */}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityStyle(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </span>

              {/* Status Badge */}
              {task.status === 'InProgress' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Đang làm
                </span>
              )}
            </div>

            {/* Mô tả */}
            {task.description && (
              <p className={`text-xs leading-relaxed mb-2.5 break-words ${
                isCompleted ? 'text-zinc-600' : 'text-zinc-400'
              }`}>
                {task.description}
              </p>
            )}

            {/* Deadline & Tags */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500">
              {task.deadline && (
                <span className={`flex items-center gap-1 font-medium ${
                  isOverdue(task.deadline, task.status) ? 'text-red-400' : 'text-zinc-400'
                }`}>
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDeadline(task.deadline)}
                  {isOverdue(task.deadline, task.status) && ' (Quá hạn)'}
                </span>
              )}

              {/* Tags */}
              {task.tags && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.split(',').map((tag) => {
                    const cleanTag = tag.trim();
                    if (!cleanTag) return null;
                    return (
                      <span key={cleanTag} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                        #{cleanTag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nút thao tác */}
        <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {/* Nút thêm subtask (chỉ cho task cha) */}
          {!isSubtask && !isCompleted && (
            <button
              onClick={() => onAddSubtask(task.id)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all focus:outline-none"
              title="Thêm công việc con"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Sửa */}
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all focus:outline-none"
            title="Chỉnh sửa"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Xoá */}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all focus:outline-none"
            title="Xoá"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Toggle Thu gọn/Mở rộng subtasks */}
          {hasSubtasks && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all focus:outline-none ml-1"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

      </div>

      {/* Render subtasks lồng nhau */}
      {hasSubtasks && isExpanded && (
        <div className="mt-1 pb-1">
          {task.subtasks?.map((subtask) => (
            <TaskCard
              key={subtask.id}
              task={subtask}
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
