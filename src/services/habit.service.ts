import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class HabitService {
  // Lấy tất cả thói quen kèm lịch sử logs của chúng
  static async getAllHabits() {
    return prisma.habit.findMany({
      include: {
        logs: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Tạo thói quen mới
  static async createHabit(data: { name: string; color?: string }) {
    return prisma.habit.create({
      data: {
        name: data.name,
        color: data.color || '#10b981',
        streak: 0,
      },
    });
  }

  // Cập nhật thói quen
  static async updateHabit(id: string, data: { name?: string; color?: string; streak?: number }) {
    const updateData: Prisma.HabitUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.streak !== undefined) updateData.streak = data.streak;

    return prisma.habit.update({
      where: { id },
      data: updateData,
    });
  }

  // Xoá thói quen
  static async deleteHabit(id: string) {
    return prisma.habit.delete({
      where: { id },
    });
  }

  // Check-in hoặc check-out thói quen vào ngày cụ thể (dateStr: YYYY-MM-DD)
  static async toggleHabitLog(habitId: string, dateStr: string) {
    // 1. Kiểm tra xem log đã tồn tại chưa
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId,
        date: dateStr,
      },
    });

    if (existingLog) {
      // Nếu đã có -> Xoá log (check-out)
      await prisma.habitLog.delete({
        where: { id: existingLog.id },
      });
    } else {
      // Nếu chưa có -> Tạo log mới (check-in)
      await prisma.habitLog.create({
        data: {
          habitId,
          date: dateStr,
        },
      });
    }

    // 2. Tính toán lại streak liên tiếp
    const streak = await this.calculateStreak(habitId);
    
    // 3. Cập nhật lại streak vào bảng Habit
    await prisma.habit.update({
      where: { id: habitId },
      data: { streak },
    });

    return this.getAllHabits();
  }

  // Helper tính chuỗi ngày hoàn thành liên tiếp (Streak)
  private static async calculateStreak(habitId: string): Promise<number> {
    const logs = await prisma.habitLog.findMany({
      where: { habitId },
      orderBy: { date: 'desc' },
    });

    if (logs.length === 0) return 0;

    const loggedDates = logs.map((l: any) => l.date);

    // Lấy ngày hiện tại hệ thống cục bộ (format YYYY-MM-DD)
    const getLocalBaseDate = (dateObj: Date) => {
      const tzoffset = dateObj.getTimezoneOffset() * 60000;
      return (new Date(dateObj.getTime() - tzoffset)).toISOString().split('T')[0];
    };

    const today = new Date();
    const todayStr = getLocalBaseDate(today);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalBaseDate(yesterday);

    let currentStreak = 0;
    let checkDate = new Date(); // Bắt đầu kiểm tra từ hôm nay ngược về trước

    // Nếu hôm nay không check và hôm qua cũng không check -> Streak reset về 0
    if (!loggedDates.includes(todayStr) && !loggedDates.includes(yesterdayStr)) {
      return 0;
    }

    // Nếu hôm nay chưa check nhưng hôm qua có check -> Bắt đầu đếm ngược từ hôm qua
    if (!loggedDates.includes(todayStr) && loggedDates.includes(yesterdayStr)) {
      checkDate = yesterday;
    }

    // Đếm ngược từng ngày liên tục
    while (true) {
      const checkDateStr = getLocalBaseDate(checkDate);
      if (loggedDates.includes(checkDateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1); // Lùi 1 ngày
      } else {
        break;
      }
    }

    return currentStreak;
  }
}
