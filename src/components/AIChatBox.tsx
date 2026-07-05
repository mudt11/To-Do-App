import React, { useState } from 'react';
import { Send, Sparkles, MessageSquare } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  data?: any; // Lưu dữ liệu JSON parse được
  error?: boolean;
}

interface AIChatBoxProps {
  onTaskParsed: (parsedData: any) => void;
}

export default function AIChatBox({ onTaskParsed }: AIChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là trợ lý AI. Bạn hãy gõ yêu cầu bằng tiếng Việt tự nhiên (ví dụ: "mai họp nhóm lúc 8h sáng bàn về slide, nhớ chuẩn bị slide báo cáo, ưu tiên cao") để tôi tự tạo công việc giúp bạn nhé.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isPending) return;

    const userText = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsPending(true);

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          clientTime: new Date().toString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `Tôi đã phân tích thành công yêu cầu: "${result.data.title}". Bạn hãy nhấn nút xem trước bên dưới để kiểm tra và lưu công việc.`,
            data: result.data,
          },
        ]);
        // Tự động trigger modal xem trước ở component cha
        onTaskParsed(result.data);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: result.error || 'Xin lỗi, tôi gặp lỗi khi phân tích câu nói này.',
            error: true,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại cấu hình hoặc API Key.',
          error: true,
        },
      ]);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-zinc-200">Trợ lý công việc Gemini</h3>
          <p className="text-[9px] text-zinc-500">Phân tích ngôn ngữ tự nhiên</p>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin scrollbar-thumb-zinc-850">
        {messages.map((msg, index) => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={index} className={`flex items-start gap-2.5 ${!isAI ? 'flex-row-reverse' : ''}`}>
              {isAI && (
                <div className="w-6 h-6 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                </div>
              )}
              
              <div className="max-w-[80%] flex flex-col gap-1.5">
                <div className={`p-3 rounded-2xl leading-relaxed break-words border ${
                  isAI
                    ? msg.error
                      ? 'bg-red-500/5 border-red-500/10 text-red-400'
                      : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-300'
                    : 'bg-purple-600 text-white border-transparent shadow-md shadow-purple-600/10'
                }`}>
                  {msg.text}
                </div>

                {/* Nút Xem trước nếu có data */}
                {isAI && msg.data && (
                  <button
                    onClick={() => onTaskParsed(msg.data)}
                    className="self-start px-2.5 py-1 text-[10px] rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-all font-medium flex items-center gap-1 focus:outline-none"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Xem đề xuất công việc</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isPending && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
              <Sparkles className="w-3 h-3 text-purple-400" />
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-zinc-500 italic animate-pulse">
              Đang phân tích câu nói...
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isPending}
            placeholder="Gõ tự nhiên như: 'mai họp lúc 8h sáng...'"
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-200 placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending || !inputValue.trim()}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:bg-zinc-800 disabled:text-zinc-600 transition-all flex-shrink-0 focus:outline-none shadow-md shadow-purple-600/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
