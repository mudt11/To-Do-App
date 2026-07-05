import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/services/task.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;
    const projectId = searchParams.get('projectId') || undefined;

    const tasks = await TaskService.getAllTasks({ status, priority, search, projectId });
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: unknown) {
    console.error('Lỗi khi lấy danh sách tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách công việc.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề công việc là bắt buộc.' },
        { status: 400 }
      );
    }

    const newTask = await TaskService.createTask(body);
    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error: unknown) {
    console.error('Lỗi khi tạo task:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo công việc mới.' },
      { status: 500 }
    );
  }
}
