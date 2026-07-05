import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { Project } from '@prisma/client';
import { TaskToEditType } from '@/app/page';

export interface TaskFormData {
  title: string;
  description: string | null;
  deadline: string | null;
  priority: string;
  status: string;
  tags: string | null;
  parentId: string | null;
  projectId: string | null;
}

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  taskToEdit?: TaskToEditType;
  parentId?: string | null;
}

export default function TaskForm({ isOpen, onClose, onSubmit, taskToEdit, parentId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [tags, setTags] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Hàm chuyển đổi Date thành định dạng YYYY-MM-DDThh:mm của datetime-local input
  const formatForInput = (dateStr: Date | string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const tzoffset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
  };

  // Fetch projects list when form open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/projects')
        .then((res) => res.json())
        .then((result) => {
          if (result.success) setProjects(result.data);
        })
        .catch((err) => console.error('Lỗi khi fetch projects:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setDeadline(formatForInput(taskToEdit.deadline || null));
      setPriority(taskToEdit.priority || 'Medium');
      setStatus(taskToEdit.status || 'Todo');
      setTags(taskToEdit.tags || '');
      setProjectId(taskToEdit.projectId || '');
    } else {
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('Medium');
      setStatus('Todo');
      setTags('');
      setProjectId('');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Tiêu đề công việc là bắt buộc.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        priority,
        status,
        tags: tags.trim() || null,
        parentId: taskToEdit ? (taskToEdit.parentId || null) : (parentId || null),
        projectId: projectId || null,
      });
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-100">
            {taskToEdit ? 'Chỉnh sửa công việc' : parentId ? 'Thêm công việc con' : 'Tạo công việc mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tiêu đề */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hạn chót */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Hạn chót
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none transition-colors scheme-dark"
              />
            </div>

            {/* Độ ưu tiên */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="Low">Thấp</option>
                <option value="Medium">Trung bình</option>
                <option value="High">Cao</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nhãn tag */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Nhãn (tags)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="học tập, họp hành, dự án"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Thuộc dự án */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Thuộc dự án</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 focus:border-purple-500 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="">Không có dự án</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trạng thái (chỉ hiển thị khi chỉnh sửa) */}
          {taskToEdit && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="Todo">Cần làm</option>
                <option value="InProgress">Đang làm</option>
                <option value="Completed">Đã hoàn thành</option>
              </select>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 bg-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors focus:outline-none"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-all focus:outline-none"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu công việc'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
