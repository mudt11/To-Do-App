import { NextRequest, NextResponse } from 'next/server';
import { HabitService } from '@/services/habit.service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sessionContext } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return sessionContext.run({ userId: session.user.id }, async () => {
    try {        await HabitService.deleteHabit(params.id);        return NextResponse.json({ success: true, message: 'Xoá thói quen thành công.' });      } catch (error: unknown) {        console.error(`Lỗi khi xoá thói quen ${params.id}:`, error);        return NextResponse.json(          { success: false, error: 'Không thể xoá thói quen.' },          { status: 500 }
        );      }

    });
}
