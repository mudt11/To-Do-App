import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class ProjectService {
  // Lấy tất cả dự án kèm thống kê số lượng task và tính % tiến độ
  static async getAllProjects() {
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects.map((project: any) => {
      const totalTasksCount = project.tasks.length;
      const completedTasksCount = project.tasks.filter((t: any) => t.status === 'Completed').length;
      const progress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

      return {
        id: project.id,
        name: project.name,
        color: project.color,
        deadline: project.deadline,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        totalTasks: totalTasksCount,
        completedTasks: completedTasksCount,
        progress,
      };
    });
  }

  // Lấy chi tiết dự án kèm danh sách task
  static async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) return null;

    const totalTasksCount = project.tasks.length;
      const completedTasksCount = project.tasks.filter((t: any) => t.status === 'Completed').length;
      const progress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    return {
      ...project,
      totalTasks: totalTasksCount,
      completedTasks: completedTasksCount,
      progress,
    };
  }

  // Tạo dự án mới
  static async createProject(data: { name: string; color?: string; deadline?: Date | string | null }) {
    const parsedDeadline = data.deadline ? new Date(data.deadline) : null;
    return prisma.project.create({
      data: {
        name: data.name,
        color: data.color || '#3b82f6',
        deadline: parsedDeadline,
      },
    });
  }

  // Cập nhật dự án
  static async updateProject(id: string, data: { name?: string; color?: string; deadline?: Date | string | null }) {
    const updateData: Prisma.ProjectUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    }

    return prisma.project.update({
      where: { id },
      data: updateData,
    });
  }

  // Xoá dự án
  static async deleteProject(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }
}
