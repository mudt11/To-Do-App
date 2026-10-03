import { NextRequest, NextResponse } from 'next/server';
import { HabitService } from '@/services/habit.service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sessionContext } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return sessionContext.run({ userId: session.user.id }, async () => {
    try {        const habits = await HabitService.getAllHabits();        return NextResponse.json({ success: true, data: habits });      } catch (error: unknown) {        console.error('Lỗi khi lấy danh sách thói quen:', error);        return NextResponse.json(          { success: false, error: 'Không thể tải danh sách thói quen.' },          { status: 500 }
        );      }

    });
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return sessionContext.run({ userId: session.user.id }, async () => {
    try {        const body = await request.json();        if (!body.name) {          return NextResponse.json(            { success: false, error: 'Tên thói quen là bắt buộc.' },            { status: 400 }
          );        }
    
        const newHabit = await HabitService.createHabit(body);        return NextResponse.json({ success: true, data: newHabit }, { status: 201 });      } catch (error: unknown) {        console.error('Lỗi khi tạo thói quen:', error);        return NextResponse.json(          { success: false, error: 'Không thể tạo thói quen mới.' },          { status: 500 }
        );      }

    });
}
