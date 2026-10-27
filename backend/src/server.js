import net from 'node:net';
import app from './app.js';
import { connectDB } from './config/db.js';
import { getJwtSecret } from './config/security.js';

const DEFAULT_PORT = Number(process.env.PORT || 5000);

const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });

const startServer = async () => {
  try {
    getJwtSecret();
    await connectDB();

    let port = DEFAULT_PORT;
    if (!(await isPortAvailable(port))) {
      port = DEFAULT_PORT + 1;
      let attempt = 2;
      while (!(await isPortAvailable(port)) && attempt < 10) {
        port = DEFAULT_PORT + attempt;
        attempt += 1;
      }
    }

    app.listen(port, () => {
      console.log(`FoundIt backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
