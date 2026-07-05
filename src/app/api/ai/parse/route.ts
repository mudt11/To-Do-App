import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/services/gemini.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, clientTime } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Nội dung yêu cầu (prompt) không được để trống.' },
        { status: 400 }
      );
    }

    const timeContext = clientTime || new Date().toString();
    const parsedData = await GeminiService.parseTaskFromNaturalLanguage(prompt, timeContext);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: unknown) {
    console.error('Lỗi khi gọi API Parse Task:', error);
    const errorMessage = error instanceof Error ? error.message : 'Không thể xử lý yêu cầu bằng AI.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
