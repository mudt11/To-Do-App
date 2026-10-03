const fs = require('fs');
const path = require('path');

function generateTree(dir, prefix = '', isLast = true) {
  let treeStr = '';
  const basename = path.basename(dir);
  
  // Skip unwanted directories
  if (basename === 'node_modules' || basename === '.git' || basename === '.next') {
    return treeStr;
  }

  treeStr += prefix + (prefix ? (isLast ? '└── ' : '├── ') : '') + basename + '\n';
  
  let children;
  try {
    children = fs.readdirSync(dir);
  } catch (e) {
    return treeStr;
  }

  const validChildren = children.filter(c => !['node_modules', '.git', '.next'].includes(c));
  
  validChildren.forEach((child, index) => {
    const isChildLast = index === validChildren.length - 1;
    const newPrefix = prefix + (prefix ? (isLast ? '    ' : '│   ') : '');
    const childPath = path.join(dir, child);
    
    if (fs.statSync(childPath).isDirectory()) {
      treeStr += generateTree(childPath, newPrefix, isChildLast);
    } else {
      treeStr += newPrefix + (isChildLast ? '└── ' : '├── ') + child + '\n';
    }
  });
  
  return treeStr;
}

const tree = generateTree(process.cwd());
fs.writeFileSync('project_tree.txt', tree);
console.log('Tree generated at project_tree.txt');
