import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/services/task.service';
import { GeminiService } from '@/services/gemini.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { clientTime } = body;

    // 1. Lấy toàn bộ danh sách task
    const allTasks = await TaskService.getAllTasksFlat();

    // 2. Lọc ra các task chưa hoàn thành
    const unfinishedTasks = allTasks.filter((task: any) => task.status !== 'Completed');
    if (unfinishedTasks.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Không có công việc chưa hoàn thành nào để tối ưu độ ưu tiên.'
      });
    }

    const timeContext = clientTime || new Date().toString();

    // 3. Gọi Gemini đề xuất sắp xếp lại độ ưu tiên
    const proposals = await GeminiService.suggestReprioritization(unfinishedTasks, timeContext);

    // 4. Map thêm title và priority hiện tại để UI hiển thị trực quan
    const detailedProposals = proposals.map((prop: { id: string; suggestedPriority: string; reason: string }) => {
      const task = unfinishedTasks.find(t => t.id === prop.id);
      return {
        ...prop,
        title: task ? task.title : 'Công việc không xác định',
        currentPriority: task ? task.priority : 'Medium'
      };
    });

    return NextResponse.json({ success: true, data: detailedProposals });
  } catch (error: unknown) {
    console.error('Lỗi khi gọi API Prioritize:', error);
    const errorMessage = error instanceof Error ? error.message : 'Không thể tính toán độ ưu tiên bằng AI.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
