import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/services/task.service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sessionContext } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return sessionContext.run({ userId: session.user.id }, async () => {
    try {        const id = params.id;        const body = await request.json();            const updatedTask = await TaskService.updateTask(id, body);        return NextResponse.json({ success: true, data: updatedTask });      } catch (error: unknown) {        console.error(`Lỗi khi cập nhật task ${params.id}:`, error);        return NextResponse.json(          { success: false, error: 'Không thể cập nhật công việc.' },          { status: 500 }
        );      }

    });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return sessionContext.run({ userId: session.user.id }, async () => {
    try {        const id = params.id;        await TaskService.deleteTask(id);        return NextResponse.json({ success: true, message: 'Xoá công việc thành công.' });      } catch (error: unknown) {        console.error(`Lỗi khi xoá task ${params.id}:`, error);        return NextResponse.json(          { success: false, error: 'Không thể xoá công việc.' },          { status: 500 }
        );      }

    });
}
