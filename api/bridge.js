import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'vota.axy.my.id';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const serverUrl = `${proto}://${host}`;
  const type = (req.query?.type || 'ps1').toLowerCase();

  const scriptsDir = path.join(process.cwd(), 'scripts');
  let filename = 'bridge.ps1';
  let contentType = 'text/plain; charset=utf-8';

  if (type === 'sh' || type === 'termux') {
    filename = 'bridge.sh';
  } else if (type === 'tcpip') {
    filename = 'tcpip.ps1';
  } else if (type === 'py') {
    filename = 'bridge.py';
  }

  const scriptPath = path.join(scriptsDir, filename);
  if (!fs.existsSync(scriptPath)) {
    res.status(404).send('# Script not found');
    return;
  }

  const template = fs.readFileSync(scriptPath, 'utf8');
  const rendered = template.replaceAll('__SERVER_URL__', serverUrl);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(rendered);
}
