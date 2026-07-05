import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface PriorityProposal {
  id: string;
  title: string;
  currentPriority: string;
  suggestedPriority: string;
  reason: string;
}

interface AIPriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: PriorityProposal[];
  onApply: (selectedProposals: { id: string; suggestedPriority: string }[]) => Promise<void>;
}

export default function AIPriorityModal({ isOpen, onClose, proposals, onApply }: AIPriorityModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (proposals) {
      // Mặc định chọn tất cả các đề xuất có sự thay đổi thực sự
      const changeIds = proposals
        .filter((p) => p.currentPriority !== p.suggestedPriority)
        .map((p) => p.id);
      setSelectedIds(changeIds);
    }
  }, [proposals, isOpen]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const changesOnly = proposals.filter((p) => p.currentPriority !== p.suggestedPriority);
    if (selectedIds.length === changesOnly.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(changesOnly.map((p) => p.id));
    }
  };

  const handleApplyClick = async () => {
    if (selectedIds.length === 0) return;
    
    const selectedProposals = proposals
      .filter((p) => selectedIds.includes(p.id))
      .map((p) => ({ id: p.id, suggestedPriority: p.suggestedPriority }));

    try {
      setIsApplying(true);
      await onApply(selectedProposals);
      onClose();
    } catch {
      alert('Lỗi khi áp dụng độ ưu tiên mới.');
    } finally {
      setIsApplying(false);
    }
  };

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

  // Chỉ lấy danh sách có thay đổi thực sự để hiển thị nổi bật
  const actualChanges = proposals.filter(p => p.currentPriority !== p.suggestedPriority);
  const noChanges = proposals.filter(p => p.currentPriority === p.suggestedPriority);

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
              <h2 className="text-base font-semibold text-zinc-100">
                Đề xuất tối ưu độ ưu tiên của AI
              </h2>
              <p className="text-[10px] text-zinc-500">Xem xét và áp dụng mức độ ưu tiên hợp lý nhất</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
              <AlertCircle className="w-10 h-10 text-zinc-600 mb-2" />
              <p className="text-xs">Không có công việc chưa hoàn thành nào để tối ưu.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Actual Changes Area */}
              {actualChanges.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-zinc-300">Công việc cần tối ưu ({actualChanges.length})</h3>
                    <button
                      onClick={toggleSelectAll}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-medium focus:outline-none"
                    >
                      {selectedIds.length === actualChanges.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {actualChanges.map((prop) => {
                      const isSelected = selectedIds.includes(prop.id);
                      return (
                        <div
                          key={prop.id}
                          onClick={() => toggleSelect(prop.id)}
                          className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-500/5 border-purple-500/30'
                              : 'bg-zinc-950/20 border-zinc-800/80 hover:border-zinc-700/80'
                          }`}
                        >
                          {/* Checkbox */}
                          <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-zinc-700 bg-zinc-900'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          {/* Dữ liệu hiển thị */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-zinc-200 truncate mb-1">{prop.title}</h4>
                            
                            {/* So sánh Priority */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${getPriorityBadgeStyle(prop.currentPriority)}`}>
                                {getPriorityLabel(prop.currentPriority)}
                              </span>
                              <ArrowRight className="w-3 h-3 text-zinc-600" />
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${getPriorityBadgeStyle(prop.suggestedPriority)}`}>
                                {getPriorityLabel(prop.suggestedPriority)}
                              </span>
                            </div>

                            {/* Lý do */}
                            <p className="text-[10px] text-zinc-500 italic break-words">
                              &ldquo;{prop.reason}&rdquo;
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Changes Area */}
              {noChanges.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <h3 className="text-xs font-semibold text-zinc-400">Giữ nguyên ({noChanges.length})</h3>
                  <div className="space-y-1.5 opacity-60">
                    {noChanges.map((prop) => (
                      <div key={prop.id} className="flex items-center justify-between p-2 rounded-xl border border-zinc-800 bg-zinc-950/10 text-xs">
                        <span className="text-zinc-400 truncate max-w-[70%]">{prop.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${getPriorityBadgeStyle(prop.currentPriority)}`}>
                          {getPriorityLabel(prop.currentPriority)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors focus:outline-none"
          >
            Hủy đề xuất
          </button>
          <button
            type="button"
            onClick={handleApplyClick}
            disabled={isApplying || selectedIds.length === 0}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-all focus:outline-none"
          >
            {isApplying ? 'Đang áp dụng...' : `Áp dụng ${selectedIds.length} đề xuất`}
          </button>
        </div>

      </div>
    </div>
  );
}
