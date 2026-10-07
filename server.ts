import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Прокси для безопасного встраивания Яндекс Интернетометра в iframe приложения
  app.get('/api/yandex-meter', async (req, res) => {
    try {
      const response = await fetch('https://yandex.ru/internet/', {
        headers: {
          'User-Agent':
            (req.headers['user-agent'] as string) ||
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        }
      });

      let html = await response.text();

      // Устанавливаем базовый URL, чтобы все относительные пути (стили, скрипты, иконки) грузились с yandex.ru
      if (html.includes('<head>')) {
        html = html.replace('<head>', '<head><base href="https://yandex.ru/">');
      } else if (html.includes('<head ')) {
        html = html.replace(/<head[^>]*>/, '$&<base href="https://yandex.ru/">');
      }

      // Удаляем мета-теги CSP, если есть
      html = html.replace(/<meta[^>]*Content-Security-Policy[^>]*>/gi, '');

      // Удаляем заголовки, запрещающие iframe (X-Frame-Options и Content-Security-Policy)
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(html);
    } catch (err: any) {
      res.status(500).send(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Яндекс Интернетометр</title></head>
<body style="font-family:sans-serif;padding:30px;background:#090d16;color:#e2e8f0;text-align:center;">
  <h2 style="color:#f87171;margin-bottom:12px;">Не удалось загрузить окно Яндекс Интернетометра</h2>
  <p style="color:#94a3b8;margin-bottom:20px;">${err?.message || 'Ошибка сети'}</p>
  <a href="https://yandex.ru/internet" target="_blank" rel="noopener noreferrer"
     style="display:inline-block;padding:12px 24px;background:#0284c7;color:#fff;text-decoration:none;border-radius:12px;font-weight:bold;">
    Открыть Яндекс Интернетометр в новой вкладке
  </a>
</body>
</html>`);
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
