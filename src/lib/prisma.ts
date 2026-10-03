import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

interface CustomNodeJsGlobal {
  sessionContext: AsyncLocalStorage<{ userId: string }> | undefined;
}

export const sessionContext = 
  (global as unknown as CustomNodeJsGlobal).sessionContext || new AsyncLocalStorage<{ userId: string }>();

if (process.env.NODE_ENV !== 'production') {
  (global as unknown as CustomNodeJsGlobal).sessionContext = sessionContext;
}

const prismaClientSingleton = () => {
  let connectionString = process.env.DATABASE_URL || '';
  connectionString = connectionString.replace(/^"|"$/g, '').trim();

  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in .env!");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const basePrisma = new PrismaClient({ adapter });

  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const context = sessionContext.getStore();
          const userId = context?.userId;

          if (userId && ['Task', 'Project', 'Habit'].includes(model)) {
            // Tự động nhúng userId vào các thao tác DB cho đúng user
            if (operation === 'create') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (args.data as any).user = { connect: { id: userId } };
            } else if (operation === 'createMany') {
              if (Array.isArray(args.data)) {
                args.data = args.data.map(d => ({ ...d, userId }));
              }
            } else if (
              ['findMany', 'findFirst', 'findFirstOrThrow', 'count', 'updateMany', 'deleteMany'].includes(operation)
            ) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const anyArgs = args as any;
              anyArgs.where = { ...anyArgs.where, userId };
            } else if (['findUnique', 'findUniqueOrThrow', 'update', 'delete'].includes(operation)) {
              // Đối với thao tác Unique, ta không thể nhúng userId vào `where` trực tiếp nếu schema không cấu hình.
              // Chuyển findUnique sang findFirst để áp dụng điều kiện userId
              if (operation === 'findUnique') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (basePrisma as any)[model].findFirst({
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ...(args as any),
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  where: { ...(args as any).where, userId }
                });
              } else if (operation === 'update' || operation === 'delete') {
                // Kiểm tra quyền sở hữu trước khi update/delete
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const record = await (basePrisma as any)[model].findFirst({
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  where: { ...(args as any).where, userId }
                });
                if (!record) throw new Error("Unauthorized or not found");
              }
            }
          }
          return query(args);
        }
      }
    }
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;