const { Project, SyntaxKind } = require("ts-morph");

const project = new Project();
project.addSourceFilesAtPaths("src/app/api/**/*.ts");

const apiFiles = project.getSourceFiles("src/app/api/**/*.ts");

for (const file of apiFiles) {
  if (file.getFilePath().includes("auth") || file.getFilePath().includes("seed")) continue;
  
  let needsAuthImport = false;
  
  for (const func of file.getFunctions()) {
    if (func.isExported() && ["GET", "POST", "PUT", "DELETE", "PATCH"].includes(func.getName())) {
      const block = func.getBody();
      if (block) {
        if (!block.getText().includes("getServerSession")) {
          needsAuthImport = true;
          
          const statements = block.getStatements();
          // Remove all statements from the block
          const originalCode = statements.map(s => s.getText()).join("\n");
          
          // Clear block
          func.getStatements().forEach(s => s.remove());
          
          // Inject wrapper
          block.addStatements([
            `const session = await getServerSession(authOptions);`,
            `if (!session?.user?.id) {`,
            `  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });`,
            `}`,
            `return sessionContext.run({ userId: session.user.id }, async () => {`,
            ...originalCode.split("\n"),
            `});`
          ]);
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
    file.addImportDeclaration({
      moduleSpecifier: "@/lib/prisma",
      namedImports: ["sessionContext"]
    });
  }
  file.saveSync();
}
console.log("API patching complete");
