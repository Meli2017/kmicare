const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Le port est généralement fourni par Hostinger dans les variables d'environnement
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) {
      console.error("Erreur au démarrage du serveur :", err);
      process.exit(1);
    }
    console.log(`> Serveur Next.js démarré sur le port ${port}`);
  });
}).catch((err) => {
  console.error("Erreur lors de la préparation de Next.js :", err);
  process.exit(1);
});
