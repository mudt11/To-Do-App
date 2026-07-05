import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/services/gemini.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Tin nhắn không được để trống.' },
        { status: 400 }
      );
    }

    const responseText = await GeminiService.chatWithAssistant(message, history || []);
    
    let cleanText = responseText;
    let proposedTask = null;

    const proposalRegex = /<PROPOSAL>([\s\S]*?)<\/PROPOSAL>/i;
    const match = responseText.match(proposalRegex);
    if (match) {
      try {
        proposedTask = JSON.parse(match[1].trim());
        cleanText = responseText.replace(proposalRegex, '').trim();
      } catch (e) {
        console.error('Lỗi khi phân tích JSON proposed task từ Gemini:', e);
      }
    }

    return NextResponse.json({ success: true, data: cleanText, proposedTask });
  } catch (error: unknown) {
    console.error('Lỗi khi gọi AI Assistant API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Không thể kết nối đến trợ lý AI.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
