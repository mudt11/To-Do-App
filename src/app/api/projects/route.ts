import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/project.service';

export async function GET() {
  try {
    const projects = await ProjectService.getAllProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error: unknown) {
    console.error('Lỗi khi lấy danh sách dự án:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách dự án.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Tên dự án là bắt buộc.' },
        { status: 400 }
      );
    }

    const newProject = await ProjectService.createProject(body);
    return NextResponse.json({ success: true, data: newProject }, { status: 201 });
  } catch (error: unknown) {
    console.error('Lỗi khi tạo dự án:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo dự án mới.' },
      { status: 500 }
    );
  }
}
