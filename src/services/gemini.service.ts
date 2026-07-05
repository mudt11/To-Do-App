import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';


export class GeminiService {
  private static getModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_actual_api_key_here') {
      throw new Error('GEMINI_API_KEY chưa được thiết lập hoặc chưa đúng. Hãy cập nhật key thật trong file .env.local.');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
  }

  static async parseTaskFromNaturalLanguage(userPrompt: string, systemTimeContext: string) {
    const model = this.getModel();

    const prompt = `
Bạn là một trợ lý AI thông minh chuyên quản lý công việc cá nhân.
Nhiệm vụ của bạn là phân tích câu nói tiếng Việt sau đây từ người dùng và trích xuất thông tin để tạo công việc (task) và các công việc con (subtasks) nếu có.

Thời gian hiện tại của hệ thống (làm mốc tham chiếu cho các từ như "ngày mai", "tối nay", "thứ hai tới", v.v.): ${systemTimeContext}

Câu nói của người dùng: "${userPrompt}"

Hãy phân tích và trả về một đối tượng JSON khớp chính xác với cấu trúc TypeScript Interface sau:
interface AIParseResult {
  title: string;       // Tiêu đề công việc ngắn gọn, rõ ràng, viết hoa chữ cái đầu.
  description: string | null; // Chi tiết công việc bổ sung (nếu có), hoặc null.
  deadline: string | null;    // Hạn chót dạng ISO 8601 (ví dụ: "2026-07-03T08:00:00.000Z"), tính toán dựa trên mốc thời gian hệ thống và múi giờ cục bộ. Trả về null nếu câu nói không chứa thông tin về thời gian/hạn chót.
  priority: 'High' | 'Medium' | 'Low'; // Độ ưu tiên: dựa trên tính chất khẩn cấp hoặc từ ngữ nhấn mạnh (ví dụ: "gấp", "quan trọng", "ngay" -> High, "rảnh làm" -> Low, mặc định là Medium).
  tags: string | null; // Các nhãn liên quan phân tách bằng dấu phẩy (ví dụ: "học tập, dự án" hoặc null).
  subtasks: {          // Danh sách công việc con nếu câu nói có ý chia nhỏ hoặc đề cập nhiều bước làm. Trả về mảng rỗng [] nếu không có.
    title: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

Chỉ trả về chuỗi JSON thô, không kèm định dạng markdown codeblock.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText.trim());
    } catch (e) {
      console.error('Lỗi khi parse JSON từ Gemini response:', responseText, e);
      throw new Error('Gemini phản hồi không đúng cấu trúc JSON mong đợi.');
    }
  }

  static async suggestReprioritization(tasks: {
    id: string;
    title: string;
    description: string | null;
    deadline: Date | string | null;
    priority: string;
    status: string;
  }[], systemTimeContext: string) {
    const model = this.getModel();

    const prompt = `
Bạn là một chuyên gia quản lý thời gian và sắp xếp công việc.
Nhiệm vụ của bạn là xem xét danh sách các công việc chưa hoàn thành dưới đây, đánh giá lại mức độ ưu tiên của chúng dựa trên:
1. Tính khẩn cấp (Hạn chót/Deadline gần nhất).
2. Tầm quan trọng (Dựa trên tiêu đề và mô tả công việc).

Mốc thời gian hiện tại của hệ thống để so sánh: ${systemTimeContext}

Danh sách công việc cần đánh giá:
${JSON.stringify(tasks.map(t => ({
  id: t.id,
  title: t.title,
  description: t.description,
  deadline: t.deadline,
  currentPriority: t.priority,
  status: t.status
})), null, 2)}

Hãy trả về một danh sách các công việc có sự thay đổi về độ ưu tiên, hoặc đề xuất mới (kể cả khi giữ nguyên nếu thấy hợp lý). Định dạng trả về bắt buộc phải là một mảng JSON khớp với cấu trúc TypeScript sau:

interface PriorityProposal {
  id: string; // ID của công việc
  suggestedPriority: 'High' | 'Medium' | 'Low'; // Độ ưu tiên đề xuất mới
  reason: string; // Lý do ngắn gọn (1 câu tiếng Việt dưới 20 từ) tại sao thay đổi hoặc giữ nguyên độ ưu tiên đó.
}[]

Chỉ trả về chuỗi JSON thô, không kèm định dạng markdown codeblock.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      return JSON.parse(responseText.trim());
    } catch (e) {
      console.error('Lỗi khi parse JSON đề xuất ưu tiên từ Gemini response:', responseText, e);
      throw new Error('Gemini phản hồi không đúng cấu trúc JSON đề xuất ưu tiên mong đợi.');
    }
  }

  static async chatWithAssistant(userMessage: string, history: any[]) {
    // 1. Thu thập dữ liệu DB làm Context
    const tasks = await prisma.task.findMany({
      include: { project: true }
    });
    
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          select: { id: true, status: true }
        }
      }
    });

    const detailedProjects = projects.map((project) => {
      const total = project.tasks.length;
      const completed = project.tasks.filter((t) => t.status === 'Completed').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { name: project.name, progress: `${progress}%`, ratio: `${completed}/${total}` };
    });

    const habits = await prisma.habit.findMany();

    const unfinishedTasks = tasks.filter(t => t.status !== 'Completed');
    const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;

  const localTimeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const context = `
Bạn là một trợ lý AI thông minh tích hợp trong ứng dụng AI TodoFlow của người dùng tên là "Đình Thạch".
Bạn có quyền truy cập trực tiếp vào cơ sở dữ liệu công việc hiện tại của Đình Thạch để tư vấn, phân tích hiệu suất và lập kế hoạch giúp anh ấy.

Dưới đây là DỮ LIỆU CỦA ĐÌNH THẠCH hiện tại:
- Người dùng: Đình Thạch (email: dinhthach@gmail.com).
- Tổng số công việc đã tạo: ${tasks.length} (Đã hoàn thành: ${completedTasksCount}, Chưa hoàn thành: ${unfinishedTasks.length}).
- Danh sách công việc CHƯA hoàn thành:
${JSON.stringify(unfinishedTasks.map(t => ({
  title: t.title,
  description: t.description,
  priority: t.priority,
  deadline: t.deadline,
  project: t.project ? t.project.name : null,
  tags: t.tags
})), null, 2)}
- Danh sách Dự án:
${JSON.stringify(detailedProjects, null, 2)}
- Danh sách Thói quen đang rèn luyện:
${JSON.stringify(habits.map(h => ({
  name: h.name,
  streak: `${h.streak} ngày liên tiếp`
})), null, 2)}

HƯỚNG DẪN TRẢ LỜI:
1. Xưng hô thân thiện, gọi người dùng là "Đình Thạch" hoặc "anh Thạch".
2. Dựa vào dữ liệu thực tế trên để tư vấn:
   - Nếu được hỏi về việc cần làm hoặc cách tối ưu: Hãy liệt kê các công việc có độ ưu tiên Cao (High) hoặc đã quá hạn, đề xuất chia nhỏ thành subtask và sắp xếp thứ tự thực hiện khoa học.
   - Nếu hỏi về thói quen: Khích lệ anh ấy tiếp tục dựa trên số ngày streak hiện có.
   - Nếu hỏi về kế hoạch tuần: Đề xuất một lịch trình phân bổ các task chưa làm vào các ngày trong tuần.
3. Trả lời bằng tiếng Việt, ngắn gọn, súc tích, định dạng Markdown rõ ràng, dễ đọc (sử dụng gạch đầu dòng, bôi đậm). Tránh viết dài dòng lan man.
4. QUAN TRỌNG: Nếu Đình Thạch yêu cầu tạo mới, lên lịch, nhắc nhở hoặc thêm một công việc/lịch trình (ví dụ: "lên lịch đi chơi chiều mai", "thêm task họp lúc 9h", v.v.), bạn HÃY PHÂN TÍCH nội dung câu nói của anh ấy thành một đối tượng JSON đề xuất công việc và đính kèm chính xác ở DÒNG CUỐI CÙNG của câu trả lời dưới định dạng tag đặc biệt như sau:
<PROPOSAL>
{
  "title": "Tên công việc ngắn gọn (viết hoa chữ đầu)",
  "description": "Chi tiết công việc bổ sung hoặc null",
  "deadline": "Hạn chót dạng ISO 8601 (tính toán dựa trên thời gian hiện tại của hệ thống là ${localTimeStr} theo múi giờ Việt Nam GMT+7. Chú ý tính toán và trả về ISO 8601 theo múi giờ địa phương bằng cách KHÔNG thêm 'Z' ở cuối, ví dụ: 2026-07-03T08:00:00), hoặc null nếu không có thời gian cụ thể",
  "priority": "High" | "Medium" | "Low",
  "tags": "Nhãn tương ứng (ví dụ: Cá nhân, Học tập, Công việc, Thói quen) hoặc null",
  "subtasks": []
}
</PROPOSAL>
Nếu người dùng chỉ trò chuyện thông thường hoặc hỏi đáp mà không có ý định tạo công việc mới, tuyệt đối KHÔNG được thêm tag <PROPOSAL> này.

`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_actual_api_key_here') {
      throw new Error('GEMINI_API_KEY chưa được thiết lập hoặc chưa đúng. Hãy cập nhật key thật trong file .env.local.');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: context
    });

    let formattedHistory = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    // Bỏ qua các tin nhắn đầu tiên trong lịch sử nếu chúng không có role là 'user'
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  }
}
