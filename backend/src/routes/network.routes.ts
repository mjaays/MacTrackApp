import { Router } from 'express';
import os from 'os';

const router = Router();

router.get('/network-url', (_req, res) => {
  const ifaces = os.networkInterfaces();
  let ip = 'localhost';
  outer: for (const name of Object.values(ifaces)) {
    for (const iface of name ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address;
        break outer;
      }
    }
  }
  res.json({ url: `http://${ip}:3000` });
});

export default router;
