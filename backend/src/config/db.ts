import mongoose from 'mongoose';
import { env } from './env';

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL_MS = 5000;

let reconnectAttempts = 0;
let isConnecting = false;

function setupConnectionEvents(): void {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
    reconnectAttempts = 0;
    isConnecting = false;
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
    if (!isConnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      scheduleReconnect();
    }
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
    reconnectAttempts = 0;
    isConnecting = false;
  });

  mongoose.connection.on('close', () => {
    console.log('🔌 MongoDB connection closed');
  });
}

function scheduleReconnect(): void {
  reconnectAttempts += 1;
  const delay = RECONNECT_INTERVAL_MS * reconnectAttempts;

  console.log(
    `🔄 Attempting MongoDB reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`
  );

  setTimeout(async () => {
    try {
      isConnecting = true;
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    } catch (err) {
      console.error('❌ MongoDB reconnect failed:', (err as Error).message);
      isConnecting = false;
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        scheduleReconnect();
      } else {
        console.error('💀 Max reconnect attempts reached. Shutting down...');
        process.exit(1);
      }
    }
  }, delay);
}

export async function connectDB(): Promise<void> {
  try {
    setupConnectionEvents();

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    console.error('❌ Initial MongoDB connection failed:', (err as Error).message);
    console.warn('⚠️  Note: If using MongoDB Atlas, please ensure your IP address is whitelisted in Atlas Network Access (e.g. 0.0.0.0/0 for testing).');
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed gracefully');
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', (err as Error).message);
  }
}

export default connectDB;
