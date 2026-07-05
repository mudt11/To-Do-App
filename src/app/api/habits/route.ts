import { NextRequest, NextResponse } from 'next/server';
import { HabitService } from '@/services/habit.service';

export async function GET() {
  try {
    const habits = await HabitService.getAllHabits();
    return NextResponse.json({ success: true, data: habits });
  } catch (error: unknown) {
    console.error('Lỗi khi lấy danh sách thói quen:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách thói quen.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Tên thói quen là bắt buộc.' },
        { status: 400 }
      );
    }

    const newHabit = await HabitService.createHabit(body);
    return NextResponse.json({ success: true, data: newHabit }, { status: 201 });
  } catch (error: unknown) {
    console.error('Lỗi khi tạo thói quen:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo thói quen mới.' },
      { status: 500 }
    );
  }
}
