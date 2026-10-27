import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer;

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    await mongoose.connect(mongoUri);
    console.log('Connected to configured MongoDB instance');
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI must be configured in production.');
  }

  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
  console.log('Connected to in-memory MongoDB for local development');
}

export async function disconnectDB() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
