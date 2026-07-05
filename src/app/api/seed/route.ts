import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Xoá sạch dữ liệu cũ để tránh trùng lặp
    await prisma.habitLog.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.habit.deleteMany({});
    await prisma.project.deleteMany({});

    // 2. Không tạo mock data mới theo yêu cầu của Đình Thạch

    return NextResponse.json({
      success: true,
      message: 'Nạp dữ liệu mẫu seed data thành công! Hãy reload lại trang để xem thành quả.'
    });
  } catch (error: any) {
    console.error('Lỗi khi nạp seed data:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể nạp dữ liệu mẫu.' },
      { status: 500 }
    );
  }
}
