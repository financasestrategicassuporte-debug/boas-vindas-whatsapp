const http = require('http');
const https = require('https');

const EVOLUTION_API_URL = 'https://gestao-de-sdrvercel-evolution-api.rcep7e.easypanel.host';
const INSTANCE = 'gfb-sdr';
const API_KEY = 'gfb2024key';
const MENSAGEM = 'Olá, Bem vindo ao grupo do Workshop para Donos de Academia. Acontecerá terça às 13h. Te vejo lá. 🎉';
const PORT = 3000;

function enviarMensagem(numero) {
  const body = JSON.stringify({
    number: numero,
    textMessage: { text: MENSAGEM }
  });

  const url = new URL(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE}`);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': API_KEY,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[${new Date().toISOString()}] Mensagem enviada para ${numero}: ${res.statusCode} - ${data}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Erro ao enviar mensagem para ${numero}:`, e.message);
  });

  req.write(body);
  req.end();
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(200);
    res.end('OK');
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const event = payload.event;
      const data = payload.data;

      console.log(`[${new Date().toISOString()}] Evento recebido: ${event}`);

      if (event === 'group-participants.update' && data?.action === 'add') {
        const participants = data.participants || [];
        console.log(`Participantes entrando: ${participants.join(', ')}`);

        setTimeout(() => {
          participants.forEach(numero => {
            enviarMensagem(numero);
          });
        }, 5000);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } catch (e) {
      console.error('Erro ao processar payload:', e.message);
      res.writeHead(400);
      res.end('Bad Request');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor de boas-vindas rodando na porta ${PORT}`);
});
