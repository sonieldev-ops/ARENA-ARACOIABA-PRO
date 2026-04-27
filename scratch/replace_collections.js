const fs = require('fs');
const path = require('path');

const mappings = {
  "'matches'": "'partidas'",
  '"matches"': '"partidas"',
  "'teams'": "'times'",
  '"teams"': '"times"',
  "'athletes'": "'atletas'",
  '"athletes"': '"atletas"',
  "'championships'": "'campeonatos'",
  '"championships"': '"campeonatos"',
  "'rankings'": "'classificacoes'",
  '"rankings"': '"classificacoes"',
  "'scorers'": "'artilheiros'",
  '"scorers"': '"artilheiros"',
  "'match_events'": "'eventos_partida'",
  '"match_events"': '"eventos_partida"',
  "'adminAuditLogs'": "'logs_auditoria'",
  '"adminAuditLogs"': '"logs_auditoria"',
  "'users'": "'usuarios'",
  '"users"': '"usuarios"',
  "'favorites'": "'favoritos'",
  '"favorites"': '"favoritos"',
  "'notifications'": "'notificacoes'",
  '"notifications"': '"notificacoes"'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Regex to find collection(db, 'name') or adminDb.collection('name')
  // We'll just replace the exact strings if they are surrounded by collection or doc
  // To be safe, we replace specific patterns
  
  const patterns = [
    /collection\([^,]+,\s*(['"][a-zA-Z_]+['"])/g,
    /\.collection\((['"][a-zA-Z_]+['"])\)/g,
    /doc\([^,]+,\s*(['"][a-zA-Z_]+['"])/g
  ];

  for (const pattern of patterns) {
    content = content.replace(pattern, (match, p1) => {
      if (mappings[p1]) {
        return match.replace(p1, mappings[p1]);
      }
      return match;
    });
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
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
console.log('Done replacing collection names.');
