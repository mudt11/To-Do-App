import { NextRequest, NextResponse } from 'next/server';
import { HabitService } from '@/services/habit.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { habitId, date } = body;

    if (!habitId || !date) {
      return NextResponse.json(
        { success: false, error: 'habitId và date (YYYY-MM-DD) là bắt buộc.' },
        { status: 400 }
      );
    }

    const updatedHabits = await HabitService.toggleHabitLog(habitId, date);
    return NextResponse.json({ success: true, data: updatedHabits });
  } catch (error: any) {
    console.error('Lỗi khi log thói quen:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật trạng thái thói quen.' },
      { status: 500 }
    );
  }
}
