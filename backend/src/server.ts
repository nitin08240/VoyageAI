import dotenv from 'dotenv';
dotenv.config();

import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import app from './app';

const PORT = parseInt(env.PORT, 10) || 5000;

async function startServer(): Promise<void> {
  try {
    // Start Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║              VoyageAI API Server                 ║
╠══════════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(32)}║
║  Port        : ${String(PORT).padEnd(32)}║
║  Client URL  : ${env.CLIENT_URL.padEnd(32)}║
║  Gemini Model: ${env.GEMINI_MODEL.padEnd(32)}║
╚══════════════════════════════════════════════════╝
      `);
    });

    // Connect to MongoDB asynchronously
    await connectDB();

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log('🔌 HTTP server closed');
        await disconnectDB();
        console.log('👋 VoyageAI API shut down complete');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason: any) => {
      console.error('❌ Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
