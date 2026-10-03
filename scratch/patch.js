const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file === 'route.ts' && !fullPath.includes('auth') && !fullPath.includes('seed')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (!content.includes('getServerSession')) {
        let imports = `import { getServerSession } from "next-auth/next";\nimport { authOptions } from "@/lib/auth";\nimport { sessionContext } from "@/lib/prisma";\n`;
        content = imports + content;

        // Replace export async function GET/POST...
        const regex = /export\s+async\s+function\s+([A-Z]+)\s*\(([^)]*)\)\s*\{/g;
        
        content = content.replace(regex, (match, method, args) => {
          return `${match}
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return sessionContext.run({ userId: session.user.id }, async () => {`;
        });

        // Đóng ngoặc `});` cho mỗi API route
        // Tìm số lượng export function đã thay thế
        const count = (content.match(/sessionContext\.run/g) || []).length;
        
        // This is a naive replacement. Since an API route typically ends with the function closing brace `}`, we can do a naive replacement or just parse correctly.
        // It's safer to use ts-morph for this exact part, but since the files are standard, we can just replace the last `}` of each function.
      }
      fs.writeFileSync(fullPath, content);
    }
  }
}

// processDir('src/app/api');
console.log('Use ts-morph instead for accurate bracket matching.');
