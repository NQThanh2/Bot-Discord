import { createServer } from 'node:http';

/**
 * HTTP server toi gian de chay tren Render "Web Service" (free tier),
 * vi Render yeu cau service phai mo 1 cong HTTP, neu khong se bao loi deploy.
 * Bot Discord von khong phuc vu HTTP nen ta tao 1 endpoint /health gia.
 *
 * Render tu dat bien moi truong PORT. Neu khong co PORT (vd chay local
 * hoac Background Worker) thi bo qua, khong mo server.
 */
export function startKeepAliveServer() {
  const port = process.env.PORT;
  if (!port) return; // Khong phai Web Service -> khong can

  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot dang chay OK\n');
  });

  server.listen(port, () => {
    console.log(`🌐 Keep-alive server dang lang nghe o cong ${port}`);
  });
}
