import { NextRequest, NextResponse } from 'next/server';
import { HabitService } from '@/services/habit.service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await HabitService.deleteHabit(params.id);
    return NextResponse.json({ success: true, message: 'Xoá thói quen thành công.' });
  } catch (error: any) {
    console.error(`Lỗi khi xoá thói quen ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Không thể xoá thói quen.' },
      { status: 500 }
    );
  }
}
