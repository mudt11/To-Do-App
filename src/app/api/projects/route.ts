import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/project.service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sessionContext } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return sessionContext.run({ userId: session.user.id }, async () => {
    try {        const projects = await ProjectService.getAllProjects();        return NextResponse.json({ success: true, data: projects });      } catch (error: unknown) {        console.error('Lỗi khi lấy danh sách dự án:', error);        return NextResponse.json(          { success: false, error: 'Không thể tải danh sách dự án.' },          { status: 500 }
        );      }

    });
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return sessionContext.run({ userId: session.user.id }, async () => {
    try {        const body = await request.json();        if (!body.name) {          return NextResponse.json(            { success: false, error: 'Tên dự án là bắt buộc.' },            { status: 400 }
          );        }
    
        const newProject = await ProjectService.createProject(body);        return NextResponse.json({ success: true, data: newProject }, { status: 201 });      } catch (error: unknown) {        console.error('Lỗi khi tạo dự án:', error);        return NextResponse.json(          { success: false, error: 'Không thể tạo dự án mới.' },          { status: 500 }
        );      }

    });
}
