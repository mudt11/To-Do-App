import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CalendarTabProps {
  onEditTask: (task: any) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

export default function CalendarTab({ onEditTask, onToggleStatus }: CalendarTabProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const result = await res.json();
      if (result.success) setTasks(result.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDay = new Date(year, month, 1).getDay(); // Ngày đầu tiên là thứ mấy (0=CN)
    const numDays = new Date(year, month + 1, 0).getDate(); // Số ngày trong tháng
    
    // Thứ 2 là đầu tuần (0=T2, 1=T3, ..., 6=CN)
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    return { adjustedStartDay, numDays };
  };

  const { adjustedStartDay, numDays } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const selectedDateTasks = tasks.filter((task) => {
    if (!task.deadline) return false;
    const d = new Date(task.deadline);
    return isSameDay(d, selectedDate);
  });

  const dayHasTasks = (dayNum: number) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    return tasks.some((task) => {
      if (!task.deadline) return false;
      return isSameDay(new Date(task.deadline), dateToCheck);
    });
  };

  const handleToggleDone = async (id: string, currentStatus: string) => {
    await onToggleStatus(id, currentStatus);
    fetchTasks();
  };

  const daysArray = [];
  for (let i = 0; i < adjustedStartDay; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= numDays; i++) {
    daysArray.push(i);
  }

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      
      {/* Lưới lịch (3/5 width) */}
      <div className="lg:col-span-3 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-4">
        {/* Header Calendar */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200">
            {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors focus:outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors focus:outline-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-2 border-b border-zinc-850 pb-2 text-center text-[10px] text-zinc-500 font-semibold uppercase">
          <div>T2</div>
          <div>T3</div>
          <div>T4</div>
          <div>T5</div>
          <div>T6</div>
          <div>T7</div>
          <div>CN</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2.5 text-center">
          {daysArray.map((dayNum, index) => {
            if (dayNum === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
            const isSelected = isSameDay(checkDate, selectedDate);
            const isToday = isSameDay(checkDate, new Date());
            const hasTask = dayHasTasks(dayNum);

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => setSelectedDate(checkDate)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white font-extrabold shadow-lg shadow-purple-600/30'
                    : isToday
                    ? 'border border-purple-500/50 text-purple-400 font-bold bg-purple-500/5'
                    : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                }`}
              >
                <span className="text-xs">{dayNum}</span>
                {/* Indicator dot */}
                {hasTask && (
                  <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-white' : 'bg-purple-500'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lịch trình ngày được chọn (2/5 width) */}
      <div className="lg:col-span-2 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col space-y-4">
        <div>
          <h3 className="text-xs font-bold text-zinc-300">Công việc chi tiết</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Hôm nay: {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {selectedDateTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-xs text-center">
              Không có công việc nào có hạn chót vào ngày này.
            </div>
          ) : (
            selectedDateTasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/20 hover:border-zinc-700/60 transition-colors"
                >
                  <button
                    onClick={() => handleToggleDone(task.id, task.status)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-zinc-700 bg-zinc-900 hover:border-purple-600'
                    }`}
                  >
                    {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0" onClick={() => onEditTask(task)}>
                    <h4 className={`text-xs font-semibold truncate cursor-pointer ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200 hover:text-purple-400'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[8px] text-zinc-500">
                        {new Date(task.deadline!).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {task.tags && (
                        <span className="text-[8px] px-1 rounded bg-purple-500/10 text-purple-400 font-semibold">
                          {task.tags.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
