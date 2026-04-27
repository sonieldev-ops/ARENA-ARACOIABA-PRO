const fs = require('fs');
const path = require('path');

const urlMappings = {
  "/admin/matches": "/admin/partidas",
  "/admin/teams": "/admin/times",
  "/admin/athletes": "/admin/atletas",
  "/admin/championships": "/admin/campeonatos",
  "/admin/scorers": "/admin/artilheiros",
  "/admin/ranking": "/admin/classificacao",
  "/admin/users": "/admin/usuarios",
  "/admin/audit": "/admin/auditoria",
  "/matches": "/partidas",
  "/match": "/partida",
  "/scorers": "/artilheiros",
  "/ranking": "/classificacao"
};

function renameFolders() {
  const adminDir = path.join('app', 'admin');
  const rootDir = 'app';

  const folderMappings = [
    { base: adminDir, old: 'matches', new: 'partidas' },
    { base: adminDir, old: 'teams', new: 'times' },
    { base: adminDir, old: 'athletes', new: 'atletas' },
    { base: adminDir, old: 'championships', new: 'campeonatos' },
    { base: adminDir, old: 'scorers', new: 'artilheiros' },
    { base: adminDir, old: 'ranking', new: 'classificacao' },
    { base: adminDir, old: 'users', new: 'usuarios' },
    { base: adminDir, old: 'audit', new: 'auditoria' },
    { base: rootDir, old: 'matches', new: 'partidas' },
    { base: rootDir, old: 'match', new: 'partida' },
    { base: rootDir, old: 'scorers', new: 'artilheiros' },
    { base: rootDir, old: 'ranking', new: 'classificacao' }
  ];

  folderMappings.forEach(m => {
    const oldPath = path.join(m.base, m.old);
    const newPath = path.join(m.base, m.new);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed folder: ${oldPath} -> ${newPath}`);
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We sort by length descending to avoid replacing substrings incorrectly
  const keys = Object.keys(urlMappings).sort((a, b) => b.length - a.length);

  for (const oldUrl of keys) {
    const newUrl = urlMappings[oldUrl];
    // This regex ensures we only replace the URL when it's part of a string (href="...", router.push('...'), etc)
    const regex = new RegExp(`(['"\`])${oldUrl}([/\\?#'"\`]|$)`, 'g');
    content = content.replace(regex, `$1${newUrl}$2`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated URLs in: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'android') continue;
    
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir('./');
console.log('Done replacing URLs and folders.');
