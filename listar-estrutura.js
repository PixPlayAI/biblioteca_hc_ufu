import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para obter o diretório atual em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  '.vscode',
  '.idea',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.vercel',
  '.turbo'
];

const EXCLUDE_FILES = [
  '.DS_Store',
  'Thumbs.db',
  '*.log',
  '.env.local',
  '.env.production',
  '.env.development'
];

const MAX_DEPTH = 4;

// Cores para o terminal (funciona no PowerShell moderno)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m'
};

// Caracteres para a árvore
const chars = {
  branch: '├── ',
  lastBranch: '└── ',
  vertical: '│   ',
  empty: '    '
};

// Função para verificar se deve excluir
function shouldExclude(name, isDirectory) {
  if (isDirectory) {
    return EXCLUDE_DIRS.includes(name);
  }
  
  // Verifica padrões de arquivo
  return EXCLUDE_FILES.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(name);
    }
    return pattern === name;
  });
}

// Função para obter ícone baseado no tipo de arquivo
function getIcon(name, isDirectory) {
  if (isDirectory) return '📁';
  
  const ext = path.extname(name).toLowerCase();
  const icons = {
    '.js': '📜',
    '.jsx': '⚛️',
    '.ts': '📘',
    '.tsx': '⚛️',
    '.json': '📋',
    '.md': '📝',
    '.css': '🎨',
    '.scss': '🎨',
    '.html': '🌐',
    '.png': '🖼️',
    '.jpg': '🖼️',
    '.jpeg': '🖼️',
    '.gif': '🖼️',
    '.svg': '🖼️',
    '.env': '🔐',
    '.gitignore': '📛',
    '.txt': '📄',
    '.cjs': '📜',
    '.mjs': '📜'
  };
  
  return icons[ext] || '📄';
}

// Função recursiva para listar estrutura
function listStructure(dir, prefix = '', depth = 0) {
  if (depth > MAX_DEPTH) return;
  
  try {
    const items = fs.readdirSync(dir);
    const files = [];
    const dirs = [];
    
    // Separa arquivos e diretórios
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          if (!shouldExclude(item, true)) {
            dirs.push(item);
          }
        } else {
          if (!shouldExclude(item, false)) {
            files.push(item);
          }
        }
      } catch (err) {
        // Ignora erros de permissão
      }
    });
    
    // Ordena alfabeticamente
    dirs.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    const allItems = [...dirs, ...files];
    
    allItems.forEach((item, index) => {
      const isLast = index === allItems.length - 1;
      const isDirectory = dirs.includes(item);
      const icon = getIcon(item, isDirectory);
      const branch = isLast ? chars.lastBranch : chars.branch;
      
      // Colorização
      let itemColor = '';
      if (isDirectory) {
        itemColor = colors.cyan + colors.bright;
      } else {
        const ext = path.extname(item).toLowerCase();
        if (['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(ext)) {
          itemColor = colors.yellow;
        } else if (['.json', '.md'].includes(ext)) {
          itemColor = colors.green;
        } else if (['.css', '.scss'].includes(ext)) {
          itemColor = colors.blue;
        }
      }
      
      console.log(`${prefix}${branch}${icon} ${itemColor}${item}${colors.reset}`);
      
      if (isDirectory && depth < MAX_DEPTH) {
        const newPrefix = prefix + (isLast ? chars.empty : chars.vertical);
        listStructure(path.join(dir, item), newPrefix, depth + 1);
      }
    });
    
  } catch (err) {
    console.error(`Erro ao ler diretório ${dir}:`, err.message);
  }
}

// Função principal
function main() {
  console.log('\n' + colors.bright + colors.cyan + '🏗️  ESTRUTURA DO PROJETO' + colors.reset);
  console.log(colors.dim + '━'.repeat(50) + colors.reset + '\n');
  
  const projectRoot = process.cwd();
  const projectName = path.basename(projectRoot);
  
  console.log(`📦 ${colors.bright}${colors.yellow}${projectName}${colors.reset}`);
  listStructure(projectRoot);
  
  console.log('\n' + colors.dim + '━'.repeat(50) + colors.reset);
  console.log(colors.dim + `✨ Estrutura listada até ${MAX_DEPTH} níveis de profundidade` + colors.reset);
  console.log(colors.dim + `📊 Pastas excluídas: ${EXCLUDE_DIRS.join(', ')}` + colors.reset + '\n');
}

// Executa
main();