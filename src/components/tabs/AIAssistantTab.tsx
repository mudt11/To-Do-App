import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { ParsedTaskData } from '../AIChatBox';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantTabProps {
  onProposeTask?: (task: ParsedTaskData) => void;
}

export default function AIAssistantTab({ onProposeTask }: AIAssistantTabProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('ai_chat_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        role: 'model',
        text: 'Chào anh Đình Thạch! Tôi đã đồng bộ toàn bộ dữ liệu công việc, dự án và thói quen của anh. Hôm nay anh cần tôi hỗ trợ lập kế hoạch tuần, phân tích năng suất, hay gợi ý công việc ưu tiên?',
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      // Map đúng cấu trúc history mong đợi từ API
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setMessages((prev) => [...prev, { role: 'model', text: result.data }]);
        if (result.proposedTask && onProposeTask) {
          onProposeTask(result.proposedTask);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: 'Xin lỗi anh Thạch, tôi gặp sự cố kết nối với bộ não Gemini. Vui lòng kiểm tra lại API Key.' },
        ]);
      }
    } catch (_e) {
      console.error(_e);
      setMessages((prev) => [...prev, { role: 'model', text: 'Không thể kết nối đến máy chủ AI.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    'Gợi ý công việc quan trọng hôm nay',
    'Phân tích năng suất & đề xuất thói quen mới',
    'Lập kế hoạch tuần cho các công việc quá hạn',
  ];

  return (
    <div className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md overflow-hidden h-[calc(100vh-12rem)] shadow-2xl relative">
      
      {/* Background AI Glow */}
      <div className="absolute top-10 right-10 w-44 h-44 bg-purple-600/5 rounded-full blur-2xl pointer-events-none -z-10 animate-pulse" />

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex items-start gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
              
              {/* Bot Icon */}
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mt-1 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[75%] p-3.5 rounded-2xl border text-xs leading-relaxed whitespace-pre-line ${
                isUser
                  ? 'bg-purple-600 border-purple-500 text-white font-medium rounded-tr-none'
                  : 'bg-zinc-950/20 border-zinc-800 text-zinc-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>

            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mt-1 flex-shrink-0 animate-spin">
              <Loader2 className="w-4 h-4" />
            </div>
            <div className="p-3 bg-zinc-950/25 border border-zinc-800 text-zinc-500 text-xs rounded-2xl rounded-tl-none animate-pulse">
              Đang phân tích dữ liệu database và suy nghĩ câu trả lời...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Panel */}
      <div className="px-5 py-2.5 border-t border-zinc-850 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isSending}
            className="px-3.5 py-1.5 text-[10px] font-semibold rounded-lg border border-zinc-800 bg-zinc-950/30 text-zinc-400 hover:border-zinc-700/80 hover:text-zinc-200 disabled:opacity-50 transition-all focus:outline-none"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="Hỏi trợ lý AI bất kỳ điều gì..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-600 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 disabled:opacity-40 transition-all focus:outline-none flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
