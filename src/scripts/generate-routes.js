// scripts/generate-routes.js
const fs = require('fs');
const path = require('path');

function scanDirectory(dir, prefix = '') {
  let routes = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (item.startsWith('(') && item.endsWith(')')) {
        // Ignorar route groups: (auth), (admin) etc
        continue;
      }
      
      if (item === 'api') {
        routes.push(...scanDirectory(fullPath, '/api'));
      } else {
        const routePath = prefix + '/' + item;
        routes.push(routePath);
        routes.push(...scanDirectory(fullPath, routePath));
      }
    } else if (item === 'page.tsx' || item === 'route.ts') {
      // É uma rota válida
      if (prefix) {
        routes.push(prefix);
      }
    }
  }
  
  return [...new Set(routes)]; // Remove duplicatas
}

const appDir = path.join(process.cwd(), 'src/app');
const routes = scanDirectory(appDir);

// Ordenar do maior para o menor (para matching correto)
routes.sort((a, b) => b.length - a.length);

console.log('🛣️ Rotas encontradas:', routes);

// Salvar em arquivo ou gerar variável de ambiente
const envContent = `APP_ROUTES=${routes.join(',')}`;
fs.writeFileSync('.routes.env', envContent);

console.log('✅ Arquivo .routes.env gerado!');