import mongoose from 'mongoose';
import { env } from './env';

const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 30000, // 30s allows Atlas replica set elections & transient failover without error
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 25,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
  heartbeatFrequencyMS: 10000,
  autoIndex: true,
};

function setupConnectionEvents(): void {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Driver is handling automatic topology reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected successfully');
  });

  mongoose.connection.on('close', () => {
    console.log('🔌 MongoDB connection closed');
  });
}

export async function connectDB(): Promise<void> {
  try {
    setupConnectionEvents();

    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(env.MONGODB_URI, MONGOOSE_OPTIONS);
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
