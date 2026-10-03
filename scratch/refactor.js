const { Project, SyntaxKind } = require("ts-morph");

const project = new Project();
project.addSourceFilesAtPaths("src/app/api/**/*.ts");
project.addSourceFilesAtPaths("src/services/**/*.ts");

// 1. Refactor Services
const services = [
  "src/services/task.service.ts",
  "src/services/project.service.ts",
  "src/services/habit.service.ts",
];

for (const svcPath of services) {
  const file = project.getSourceFile(svcPath);
  if (!file) continue;

  const classes = file.getClasses();
  for (const cls of classes) {
    for (const method of cls.getStaticMethods()) {
      // Bỏ qua nếu đã có tham số userId
      if (method.getParameter("userId")) continue;

      // Thêm tham số userId: string vào đầu tiên
      method.insertParameter(0, { name: "userId", type: "string" });

      // Cập nhật Prisma queries trong method này
      const calls = method.getDescendantsOfKind(SyntaxKind.CallExpression);
      for (const call of calls) {
        const expr = call.getExpression().getText();
        if (expr.startsWith("prisma.task.") || expr.startsWith("prisma.project.") || expr.startsWith("prisma.habit.") || expr.startsWith("prisma.habitLog.")) {
          
          const args = call.getArguments();
          if (args.length === 0) {
            // prisma.model.findMany() -> findMany({ where: { userId } })
            if (expr.endsWith(".findMany") || expr.endsWith(".findFirst")) {
              call.addArgument(`{ where: { userId } }`);
            }
          } else {
            const arg = args[0];
            if (arg.getKind() === SyntaxKind.ObjectLiteralExpression) {
              const obj = arg;
              
              if (expr.endsWith(".create")) {
                const dataProp = obj.getProperty("data");
                if (dataProp && dataProp.getKind() === SyntaxKind.PropertyAssignment) {
                  const dataInit = dataProp.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
                  if (dataInit) {
                    dataInit.addPropertyAssignment({ name: "userId", initializer: "userId" });
                  }
                }
              } else if (expr.endsWith(".findMany") || expr.endsWith(".findUnique") || expr.endsWith(".findFirst") || expr.endsWith(".update") || expr.endsWith(".delete")) {
                let whereProp = obj.getProperty("where");
                if (!whereProp) {
                  obj.addPropertyAssignment({ name: "where", initializer: "{ userId }" });
                } else if (whereProp.getKind() === SyntaxKind.PropertyAssignment) {
                  const whereInit = whereProp.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
                  // Check if it already has userId
                  if (whereInit && !whereInit.getProperty("userId")) {
                    whereInit.addPropertyAssignment({ name: "userId", initializer: "userId" });
                  } else if (whereProp.getInitializerIfKind(SyntaxKind.Identifier)) {
                    // if it's `where` (shorthand), we need to modify the referenced variable
                    // This is too complex for automatic refactor, we will manually patch task.service.ts `where` variable
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  file.saveSync();
}

// 2. Refactor API Routes
const apiFiles = project.getSourceFiles("src/app/api/**/*.ts");
for (const file of apiFiles) {
  // Skip auth routes
  if (file.getFilePath().includes("auth") || file.getFilePath().includes("seed")) continue;
  
  let needsAuthImport = false;
  
  for (const func of file.getFunctions()) {
    if (func.isExported() && ["GET", "POST", "PUT", "DELETE", "PATCH"].includes(func.getName())) {
      const block = func.getBody();
      if (block) {
        // Add session check at the beginning of the block
        if (!block.getText().includes("getServerSession")) {
          needsAuthImport = true;
          
          const statements = block.getStatements();
          const firstStatementIndex = statements.length > 0 && statements[0].getText().includes("try") ? 1 : 0;
          
          let insertionIndex = 0;
          if (statements.length > 0 && statements[0].getKind() === SyntaxKind.TryStatement) {
             const tryBlock = statements[0].getTryBlock();
             tryBlock.insertStatements(0, `
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
`);
          } else {
             block.insertStatements(0, `
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
`);
          }

          // Replace TaskService.method(args) with TaskService.method(userId, args)
          const calls = block.getDescendantsOfKind(SyntaxKind.CallExpression);
          for (const call of calls) {
             const text = call.getExpression().getText();
             if (text.includes("TaskService.") || text.includes("ProjectService.") || text.includes("HabitService.") || text.includes("GeminiService.")) {
                call.insertArgument(0, "userId");
             }
          }
        }
      }
    }
  }
  
  if (needsAuthImport) {
    file.addImportDeclaration({
      moduleSpecifier: "next-auth",
      namedImports: ["getServerSession"]
    });
    file.addImportDeclaration({
      moduleSpecifier: "@/lib/auth",
      namedImports: ["authOptions"]
    });
  }
  file.saveSync();
}

console.log("Refactoring complete");
