const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src'); // ajuste para seu caminho raiz do código

function replaceImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const oldImports = [
    /@supabase\/auth-helpers-react/g,
    /@supabase\/auth-helpers-nextjs/g,
    /@supabase\/auth-helpers-shared/g
  ];

  oldImports.forEach(oldImport => {
    content = content.replace(oldImport, '@supabase/ssr');
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
      replaceImports(fullPath);
      console.log(`Updated imports in: ${fullPath}`);
    }
  });
}

walkDir(dir);
