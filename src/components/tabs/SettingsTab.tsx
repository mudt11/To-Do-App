import React, { useState } from 'react';
import { User, Shield, Bell, Key, Database, Globe, Info, Download, Upload, LogOut } from 'lucide-react';

export default function SettingsTab() {
  const [activeMenu, setActiveMenu] = useState('account');
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('vi');

  const menuItems = [
    { id: 'account', label: 'Tài khoản', icon: User },
    { id: 'appearance', label: 'Giao diện', icon: Shield },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Key },
    { id: 'backup', label: 'Sao lưu & đồng bộ', icon: Database },
    { id: 'language', label: 'Ngôn ngữ', icon: Globe },
    { id: 'info', label: 'Thông tin', icon: Info },
  ];

  // Xuất file JSON lưu dữ liệu backup
  const handleExportData = async () => {
    try {
      const resTasks = await fetch('/api/tasks');
      const resProjects = await fetch('/api/projects');
      const resHabits = await fetch('/api/habits');

      const tasks = await resTasks.json();
      const projects = await resProjects.json();
      const habits = await resHabits.json();

      const backupData = {
        exportedAt: new Date().toISOString(),
        tasks: tasks.data || [],
        projects: projects.data || [],
        habits: habits.data || [],
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `todoflow_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
      alert('Không thể xuất dữ liệu sao lưu.');
    }
  };

  const handleImportData = () => {
    alert('Tính năng nhập dữ liệu đang được đồng bộ hóa với dịch vụ cloud.');
  };

  return (
    <div className="flex flex-col md:flex-row rounded-3xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md overflow-hidden min-h-[480px]">
      
      {/* Sidebar Settings (Trái) */}
      <div className="w-full md:w-64 border-r border-zinc-800 bg-zinc-950/15 p-4 flex flex-col justify-between">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  isActive
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area (Phải) */}
      <div className="flex-1 p-6 space-y-6">
        {activeMenu === 'account' ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Thông tin tài khoản</h3>
              <p className="text-[10px] text-zinc-500">Quản lý các tuỳ chọn và thông tin cá nhân của bạn</p>
            </div>

            {/* Profile Row */}
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
                DT
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-zinc-200">Đình Thạch</h4>
                <p className="text-[10px] text-zinc-500 font-medium">dinhthach@gmail.com</p>
              </div>
              <button className="px-3.5 py-1.5 text-[10px] font-bold rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors focus:outline-none ml-auto">
                Chỉnh sửa
              </button>
            </div>

            {/* Dropdown Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Chế độ giao diện</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="dark">Tối (Mặc định)</option>
                  <option value="light">Sáng</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Ngôn ngữ hiển thị</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Múi giờ hệ thống</label>
                <select
                  disabled
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-500 focus:outline-none"
                >
                  <option value="gmt7">(GMT+7) Bangkok, Hanoi, Jakarta</option>
                </select>
              </div>
            </div>

            {/* Backup Action buttons */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-300">Dữ liệu sao lưu</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-800 bg-zinc-950/30 text-zinc-300 hover:border-zinc-700/80 hover:text-zinc-100 transition-all flex items-center gap-1.5 focus:outline-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất dữ liệu</span>
                </button>
                
                <button
                  onClick={handleImportData}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-800 bg-zinc-950/30 text-zinc-300 hover:border-zinc-700/80 hover:text-zinc-100 transition-all flex items-center gap-1.5 focus:outline-none"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Nhập dữ liệu</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu trong database (bao gồm các công việc, dự án và thói quen)?')) {
                      try {
                        const res = await fetch('/api/seed');
                        const result = await res.json();
                        if (result.success) {
                          alert('Đã dọn dẹp sạch toàn bộ dữ liệu database thành công!');
                          window.location.reload();
                        }
                      } catch (e) {
                        console.error(e);
                        alert('Có lỗi xảy ra khi dọn dẹp dữ liệu.');
                      }
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-red-500/25 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center gap-1.5 focus:outline-none"
                >
                  <span>Dọn dẹp Database (Xóa sạch)</span>
                </button>
              </div>
            </div>

            {/* Logout button */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => alert('Đã đăng xuất tài khoản Đình Thạch cục bộ.')}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-red-500/25 text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-xs">
            <Info className="w-8 h-8 text-zinc-700 mb-2" />
            <span>Mục thiết lập đang được cập nhật nội dung.</span>
          </div>
        )}
      </div>

    </div>
  );
}
