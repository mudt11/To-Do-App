import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, FolderOpen } from 'lucide-react';

export default function ProjectsTab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState('All'); // 'All', 'Active', 'Completed'
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [deadline, setDeadline] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const result = await res.json();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, deadline: deadline || null }),
      });
      const result = await res.json();
      if (result.success) {
        setName('');
        setDeadline('');
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá dự án này?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const colors = [
    { value: '#3b82f6', label: 'Xanh dương' },
    { value: '#10b981', label: 'Xanh lá' },
    { value: '#f59e0b', label: 'Cam' },
    { value: '#a855f7', label: 'Tím' },
    { value: '#ef4444', label: 'Đỏ' },
  ];

  // Lọc
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeSubTab === 'Completed') return p.progress === 100 && p.totalTasks > 0;
    if (activeSubTab === 'Active') return p.progress < 100 || p.totalTasks === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm dự án..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-600 transition-colors"
          />
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/35 transition-all flex items-center gap-1.5 focus:outline-none w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm dự án</span>
        </button>
      </div>

      {/* Tabs Sub */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto border-b border-zinc-850">
        {[
          { label: 'Tất cả', value: 'All' },
          { label: 'Đang thực hiện', value: 'Active' },
          { label: 'Đã hoàn thành', value: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveSubTab(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === tab.value
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Projects */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
          <FolderOpen className="w-10 h-10 text-zinc-700 mb-2.5" />
          <p className="text-xs">Chưa có dự án nào tương ứng với tiêu chí lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col justify-between h-48 hover:border-zinc-700 transition-all group relative"
            >
              {/* Delete Button (Hover) */}
              <button
                onClick={() => handleDeleteProject(p.id)}
                className="absolute top-4 right-4 text-[10px] text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-400 font-semibold transition-opacity focus:outline-none"
              >
                Xoá
              </button>

              <div className="space-y-4">
                {/* Header card */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: `${p.color}15` }}
                  >
                    <FolderOpen className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-200 truncate">{p.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">{p.completedTasks}/{p.totalTasks} công việc</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-medium">Tiến độ</span>
                    <span className="text-zinc-300 font-bold" style={{ color: p.color }}>{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${p.progress}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer card */}
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-semibold pt-3 border-t border-zinc-850">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {p.deadline
                    ? `Hạn chót: ${new Date(p.deadline).toLocaleDateString('vi-VN')}`
                    : 'Không thời hạn'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal tạo dự án mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md">
          <form
            onSubmit={handleCreateProject}
            className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl"
          >
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Tạo dự án mới</h3>
              <p className="text-[10px] text-zinc-500">Phân chia nhóm và kiểm soát tiến độ hoàn thành</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Tên dự án</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên dự án..."
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

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Hạn chót</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:border-purple-600 transition-colors"
                />
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
                Tạo dự án
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
