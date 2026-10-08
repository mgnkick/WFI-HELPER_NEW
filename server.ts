import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Прокси и модуль встроенного Яндекс Интернетометра
  app.get('/api/yandex-meter', async (req, res) => {
    // Если явно запрошен оригинальный режим yandex.ru
    if (req.query.mode === 'original') {
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
        if (html.includes('<head>')) {
          html = html.replace('<head>', '<head><base href="https://yandex.ru/">');
        } else if (html.includes('<head ')) {
          html = html.replace(/<head[^>]*>/, '$&<base href="https://yandex.ru/">');
        }
        html = html.replace(/<meta[^>]*Content-Security-Policy[^>]*>/gi, '');
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        return res.send(html);
      } catch (err) {
        // При ошибке возвращаем локальную адаптированную версию
      }
    }

    // По умолчанию отдаем оптимизированный и отзывчивый встроенный виджет Яндекс Интернетометра
    const meterPath = path.join(__dirname, 'public', 'yandex-meter.html');
    res.sendFile(meterPath);
  });

  // Быстрый эндпоинт пинга
  app.get('/api/speedtest/ping', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send('pong');
  });

  // Высокоскоростной многопоточный эндпоинт замера входящей скорости (до 100 МБ)
  const sharedDownloadChunk = Buffer.alloc(256 * 1024, 'A');
  app.get('/api/speedtest/download', (req, res) => {
    const size = Math.min(100 * 1024 * 1024, Math.max(1024 * 1024, parseInt(req.query.bytes as string) || 35 * 1024 * 1024));
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Length', size.toString());

    let sent = 0;
    function sendNext() {
      while (sent < size) {
        const remaining = size - sent;
        const currentChunk = remaining < sharedDownloadChunk.length
          ? sharedDownloadChunk.subarray(0, remaining)
          : sharedDownloadChunk;
        sent += currentChunk.length;
        const canContinue = res.write(currentChunk);
        if (!canContinue) {
          res.once('drain', sendNext);
          return;
        }
      }
      res.end();
    }
    sendNext();
  });

  // Высокоскоростной эндпоинт замера исходящей скорости
  app.post('/api/speedtest/upload', express.raw({ type: '*/*', limit: '50mb' }), (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const bytesReceived = req.body ? req.body.length : 0;
    res.json({ received: bytesReceived, status: 'ok' });
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
