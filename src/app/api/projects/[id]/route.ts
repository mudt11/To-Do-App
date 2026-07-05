import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/project.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await ProjectService.getProjectById(params.id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy dự án.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: project });
  } catch (error: unknown) {
    console.error(`Lỗi khi lấy dự án ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải thông tin dự án.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedProject = await ProjectService.updateProject(params.id, body);
    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error: unknown) {
    console.error(`Lỗi khi cập nhật dự án ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật dự án.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ProjectService.deleteProject(params.id);
    return NextResponse.json({ success: true, message: 'Xoá dự án thành công.' });
  } catch (error: unknown) {
    console.error(`Lỗi khi xoá dự án ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Không thể xoá dự án.' },
      { status: 500 }
    );
  }
}
