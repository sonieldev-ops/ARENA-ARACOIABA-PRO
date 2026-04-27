const fs = require('fs');
const path = require('path');

/**
 * Prepara o projeto para o Capacitor mantendo compatibilidade com as API Routes.
 * Como o Next.js estático não suporta /api, criamos um redirecionamento
 * para a URL hospedada se estivermos no Capacitor.
 */

const outDir = path.join(__dirname, '../out');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

// Cria um index.html básico que redireciona para a versão hosted
// Isso garante que o Capacitor sempre tenha arquivos locais para o sync inicial
// mas use a versão SSR completa com APIs para o funcionamento do app.

const redirectHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Redirecionando...</title>
    <script>
        // Redireciona para a URL hospedada
        window.location.href = 'https://arena-aracoiaba-pro.web.app';
    </script>
</head>
<body>
    <p>Carregando Arena Araçoiaba PRO...</p>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'index.html'), redirectHtml);
console.log('✅ Preparação para Capacitor concluída (Redirecionamento Hosted).');
