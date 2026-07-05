import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class TaskService {
  // Lấy tất cả task gốc (không có parentId) kèm theo subtasks của chúng, hỗ trợ bộ lọc và dự án
  static async getAllTasks(filters?: { status?: string; priority?: string; search?: string; projectId?: string }) {
    const where: Prisma.TaskWhereInput = {
      parentId: null, // Chỉ lấy task gốc làm cha
    };

    if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.priority) {
        where.priority = filters.priority;
      }
      if (filters.projectId) {
        where.projectId = filters.projectId;
      }
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
          { tags: { contains: filters.search } },
        ];
      }
    }

    return prisma.task.findMany({
      where,
      include: {
        project: true,
        subtasks: {
          include: {
            project: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Lấy toàn bộ task dạng phẳng (bao gồm thông tin dự án phục vụ AI phân tích)
  static async getAllTasksFlat() {
    return prisma.task.findMany({
      include: {
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Lấy chi tiết 1 task kèm các subtasks và dự án liên quan
  static async getTaskById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        subtasks: {
          include: {
            project: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  // Tạo mới task (hoặc subtask nếu truyền parentId)
  static async createTask(data: {
    title: string;
    description?: string | null;
    deadline?: Date | string | null;
    priority?: string;
    status?: string;
    tags?: string | null;
    isStarred?: boolean;
    parentId?: string | null;
    projectId?: string | null;
  }) {
    const parsedDeadline = data.deadline ? new Date(data.deadline) : null;
    
    const taskData: Prisma.TaskCreateInput = {
      title: data.title,
      description: data.description || null,
      deadline: parsedDeadline,
      priority: data.priority || 'Medium',
      status: data.status || 'Todo',
      tags: data.tags || null,
      isStarred: data.isStarred || false,
    };
    
    if (data.parentId) {
      taskData.parent = { connect: { id: data.parentId } };
    }
    
    if (data.projectId) {
      taskData.project = { connect: { id: data.projectId } };
    }
    
    return prisma.task.create({
      data: taskData,
      include: {
        project: true,
        subtasks: true,
      },
    });
  }

  // Cập nhật task
  static async updateTask(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      deadline?: Date | string | null;
      priority?: string;
      status?: string;
      tags?: string | null;
      isStarred?: boolean;
      parentId?: string | null;
      projectId?: string | null;
    }
  ) {
    const updateData: Prisma.TaskUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isStarred !== undefined) updateData.isStarred = data.isStarred;

    // Quản lý quan hệ với Task cha (Subtask relation)
    if (data.parentId !== undefined) {
      if (data.parentId === null) {
        updateData.parent = { disconnect: true };
      } else {
        updateData.parent = { connect: { id: data.parentId } };
      }
    }

    // Quản lý quan hệ với Dự án (Project relation)
    if (data.projectId !== undefined) {
      if (data.projectId === null) {
        updateData.project = { disconnect: true };
      } else {
        updateData.project = { connect: { id: data.projectId } };
      }
    }

    return prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        subtasks: true,
      },
    });
  }

  // Xoá task
  static async deleteTask(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  }
}
