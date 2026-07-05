'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, Search, Bell, Plus, LayoutDashboard, CheckSquare, 
  FolderOpen, Calendar, BarChart3, Bot, Check, Settings 
} from 'lucide-react';

import OverviewTab from '@/components/tabs/OverviewTab';
import TasksTab from '@/components/tabs/TasksTab';
import ProjectsTab from '@/components/tabs/ProjectsTab';
import CalendarTab from '@/components/tabs/CalendarTab';
import StatsTab from '@/components/tabs/StatsTab';
import AIAssistantTab from '@/components/tabs/AIAssistantTab';
import HabitsTab from '@/components/tabs/HabitsTab';
import SettingsTab from '@/components/tabs/SettingsTab';

import TaskForm from '@/components/TaskForm';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // States cho sidebar progress
  const [progressData, setProgressData] = useState({ percent: 72, ratio: '21 / 29 công việc' });
  const [greeting, setGreeting] = useState('Chào buổi sáng');
  const [currentDateStr, setCurrentDateStr] = useState('Hôm nay là ...');

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  // Load sidebar progress real-time
  const fetchSidebarProgress = useCallback(async () => {
    try {
      const statsRes = await fetch('/api/stats');
      const statsResult = await statsRes.json();
      if (statsResult.success) {
        const kpi = statsResult.data.kpis;
        const total = kpi.totalTasks.count;
        const completed = kpi.completedTasks.count;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        setProgressData({
          percent,
          ratio: `${completed} / ${total} công việc`
        });
      }
    } catch (e) {
      console.error('Không thể lấy tiến độ sidebar:', e);
    }
  }, []);

  // Thiết lập đồng hồ câu chào và ngày giờ
  useEffect(() => {
    fetchSidebarProgress();

    // Lấy câu chào theo giờ
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    // Lấy chuỗi ngày tiếng Việt dạng: "Hôm nay là thứ Tư, 02 tháng 07 năm 2026"
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    // Mock mốc thời gian hiển thị thân thiện giống mockup hoặc ngày giờ hệ thống thật
    const today = new Date();
    // Chuyển ngôn ngữ tiếng Việt
    const formatter = new Intl.DateTimeFormat('vi-VN', options);
    setCurrentDateStr(`Hôm nay là ${formatter.format(today)}`);
  }, [fetchSidebarProgress]);

  // Sửa/Tạo Task xong
  const handleFormSubmit = async (taskData: any) => {
    const isEdit = !!taskToEdit?.id;
    const url = isEdit ? `/api/tasks/${taskToEdit.id}` : '/api/tasks';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    const result = await res.json();
    if (result.success) {
      setIsFormOpen(false);
      fetchSidebarProgress();
      // Reload tab content by forcing a state change or re-fetch in tabs
      // Do các tab component tự fetch ở useEffect, khi modal đóng và reload state chính, 
      // ta reload trang hoặc đơn giản là set lại activeTab để component mount lại
      const current = activeTab;
      setActiveTab('');
      setTimeout(() => setActiveTab(current), 50);
    }
  };

  // Toggle nhanh các trạng thái từ Overview hoặc Task list
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'Todo' : 'Completed';
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchSidebarProgress();
  };

  const handleToggleStar = async (id: string, currentStar: boolean) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isStarred: !currentStar })
    });
    fetchSidebarProgress();
  };

  // Menu Sidebar list
  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'tasks', label: 'Công việc', icon: CheckSquare },
    { id: 'projects', label: 'Dự án', icon: FolderOpen },
    { id: 'calendar', label: 'Lịch', icon: Calendar },
    { id: 'stats', label: 'Thống kê', icon: BarChart3 },
    { id: 'ai-assistant', label: 'Trợ lý AI', icon: Bot },
    { id: 'habits', label: 'Thói quen', icon: Sparkles },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const handleProposeTask = (proposedTask: any) => {
    let formattedDeadline = '';
    if (proposedTask.deadline) {
      const d = new Date(proposedTask.deadline);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      formattedDeadline = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    setTaskToEdit({
      title: proposedTask.title || '',
      description: proposedTask.description || '',
      deadline: formattedDeadline,
      priority: proposedTask.priority || 'Medium',
      tags: proposedTask.tags || '',
      projectId: null,
      subtasks: proposedTask.subtasks || []
    });
    setParentId(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sidebar bên trái */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-900 bg-zinc-950 flex-col justify-between flex-shrink-0 z-20">
        <div className="p-6 space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              AI TodoFlow
            </span>
          </div>

          {/* Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all focus:outline-none ${
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
          </nav>
        </div>

        {/* Bottom widgets of Sidebar */}
        <div className="p-6 space-y-5 border-t border-zinc-900">
          
          {/* Progress Widget */}
          <div className="p-4 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-3">
            <h4 className="text-[10px] text-zinc-500 font-bold uppercase">Tiến độ tuần</h4>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                {/* SVG Circular Progress Bar */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-purple-500 transition-all duration-500"
                    strokeDasharray={`${progressData.percent}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-zinc-100">
                  {progressData.percent}%
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-400 font-semibold">{progressData.ratio}</p>
                <button 
                  onClick={() => setActiveTab('stats')}
                  className="text-[9px] text-purple-400 hover:text-purple-300 font-bold mt-0.5 focus:outline-none"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              DT
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-zinc-200 truncate">Đình Thạch</h4>
              <p className="text-[9px] text-zinc-500 font-medium truncate">dinhthach@gmail.com</p>
            </div>
          </div>

        </div>
      </aside>

      {/* Area Layout bên phải */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header */}
        <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            
            {/* Greeting & Date */}
            <div>
              <h2 className="text-sm font-bold text-zinc-100">
                {greeting}, Đình Thạch! 👋
              </h2>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{currentDateStr}</p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm công việc..."
                  disabled
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
              </div>

              {/* Bell Notification */}
              <button className="p-2 rounded-xl border border-zinc-900 bg-zinc-900/20 text-zinc-400 hover:text-zinc-200 relative focus:outline-none">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
              </button>

              {/* Add Task Button */}
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setParentId(null);
                  setIsFormOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/35 transition-all flex items-center gap-1.5 focus:outline-none"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm công việc</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab Content Rendering Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 overflow-hidden">
          {activeTab === 'overview' && (
            <OverviewTab
              onAddTask={() => setIsFormOpen(true)}
              onEditTask={(t) => {
                setTaskToEdit(t);
                setIsFormOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
              onToggleStar={handleToggleStar}
              onNavigateToAI={() => setActiveTab('ai-assistant')}
            />
          )}
          {activeTab === 'tasks' && (
            <TasksTab
              onAddTask={(pId) => {
                setParentId(pId || null);
                setTaskToEdit(null);
                setIsFormOpen(true);
              }}
              onEditTask={(t) => {
                setTaskToEdit(t);
                setIsFormOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
              onToggleStar={handleToggleStar}
            />
          )}
          {activeTab === 'projects' && <ProjectsTab />}
          {activeTab === 'calendar' && (
            <CalendarTab
              onEditTask={(t) => {
                setTaskToEdit(t);
                setIsFormOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
            />
          )}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'ai-assistant' && (
            <AIAssistantTab onProposeTask={handleProposeTask} />
          )}
          {activeTab === 'habits' && <HabitsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>

      {/* Bottom Nav Bar for Mobile devices */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-zinc-900 bg-zinc-950 flex items-center justify-around z-30 px-4">
        {menuItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 focus:outline-none transition-all ${
                isActive ? 'text-purple-400' : 'text-zinc-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[8px] font-bold">{item.label}</span>
            </button>
          );
        })}
        {/* Nút cộng giữa nổi bật trên mobile */}
        <button
          onClick={() => {
            setTaskToEdit(null);
            setParentId(null);
            setIsFormOpen(true);
          }}
          className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transform -translate-y-2 focus:outline-none"
        >
          <Plus className="w-5 h-5" />
        </button>
        {menuItems.slice(4, 8).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 focus:outline-none transition-all ${
                isActive ? 'text-purple-400' : 'text-zinc-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[8px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Popup Form Tạo/Sửa Task chung */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        taskToEdit={taskToEdit}
        parentId={parentId}
      />
    </div>
  );
}
