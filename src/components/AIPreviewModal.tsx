import React, { useState, useEffect } from 'react';
import { X, Calendar, Sparkles, CheckSquare, Plus, Trash2 } from 'lucide-react';

interface SubtaskItem {
  title: string;
  priority: string;
}

interface AIParseResult {
  title: string;
  description: string | null;
  deadline: string | null;
  priority: string;
  tags: string | null;
  subtasks: SubtaskItem[];
}

interface AIPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AIParseResult | null;
  onConfirm: (data: {
    title: string;
    description: string | null;
    deadline: string | null;
    priority: string;
    tags: string | null;
    subtasks: SubtaskItem[];
  }) => Promise<void>;
}

export default function AIPreviewModal({ isOpen, onClose, data, onConfirm }: AIPreviewModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [tags, setTags] = useState('');
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Chuyển đổi định dạng ngày cho datetime-local input
  const formatForInput = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const tzoffset = date.getTimezoneOffset() * 60000;
      return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (data) {
      setTitle(data.title || '');
      setDescription(data.description || '');
      setDeadline(formatForInput(data.deadline));
      setPriority(data.priority || 'Medium');
      setTags(data.tags || '');
      setSubtasks(data.subtasks || []);
    }
  }, [data, isOpen]);

  if (!isOpen || !data) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), priority: 'Medium' }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubtaskTitleChange = (index: number, newTitle: string) => {
    const updated = [...subtasks];
    updated[index].title = newTitle;
    setSubtasks(updated);
  };

  const handleSubtaskPriorityChange = (index: number, newPriority: string) => {
    const updated = [...subtasks];
    updated[index].priority = newPriority;
    setSubtasks(updated);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onConfirm({
        title: title.trim(),
        description: description.trim() || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        priority,
        tags: tags.trim() || null,
        subtasks,
      });
      onClose();
    } catch {
      alert('Không thể lưu công việc.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-purple-950/20 to-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-1.5">
                AI đề xuất công việc mới
              </h2>
              <p className="text-[10px] text-zinc-500">Xem trước và điều chỉnh thông tin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Tiêu đề chính */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Tiêu đề công việc</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Mô tả công việc</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none transition-colors resize-none text-xs"
            />
          </div>

          {/* Hạn chót & Độ ưu tiên & Nhãn */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Hạn chót
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs text-zinc-200 focus:border-purple-500 focus:outline-none scheme-dark"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs text-zinc-200 focus:border-purple-500 focus:outline-none"
              >
                <option value="Low">Thấp</option>
                <option value="Medium">Trung bình</option>
                <option value="High">Cao</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Nhãn (tags)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tags..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs text-zinc-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quản lý Subtasks */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
              <CheckSquare className="w-4 h-4 text-purple-400" />
              Công việc con (Subtasks) ({subtasks.length})
            </h3>

            {/* List Subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {subtasks.map((sub, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-xl border border-zinc-800 bg-zinc-950/20 group">
                    <input
                      type="text"
                      value={sub.title}
                      onChange={(e) => handleSubtaskTitleChange(index, e.target.value)}
                      className="flex-1 min-w-0 bg-transparent text-xs text-zinc-300 focus:outline-none"
                    />
                    <select
                      value={sub.priority}
                      onChange={(e) => handleSubtaskPriorityChange(index, e.target.value)}
                      className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700/50"
                    >
                      <option value="Low">Thấp</option>
                      <option value="Medium">Trung bình</option>
                      <option value="High">Cao</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(index)}
                      className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Thêm Subtask nhanh */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Thêm nhanh công việc con..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-zinc-100 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Hủy đề xuất
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-all"
          >
            {isSaving ? 'Đang lưu...' : 'Chấp nhận & Lưu'}
          </button>
        </div>

      </div>
    </div>
  );
}
