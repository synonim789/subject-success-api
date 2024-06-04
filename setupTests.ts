import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
   mongoServer = await MongoMemoryServer.create();
   const mongoUri = mongoServer.getUri();

   await mongoose.connect(mongoUri);
});

afterAll(async () => {
   await mongoose.disconnect();
   await mongoose.connection.close();
});
