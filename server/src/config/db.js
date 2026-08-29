const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const isPlaceholder = !uri || uri.includes('<db_username>') || uri.includes('127.0.0.1:27017');

  if (isPlaceholder) {
    console.log('Using in-memory MongoDB Server (No configuration required)...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoDB In-Memory Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`Failed to start in-memory MongoDB: ${err.message}`);
      process.exit(1);
    }
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to Atlas/Local MongoDB: ${error.message}`);
    console.log('Attempting to fall back to in-memory MongoDB Server...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoDB In-Memory Connected (Fallback): ${conn.connection.host}`);
    } catch (err) {
      console.error(`Fatal: Failed to connect to Fallback In-Memory MongoDB: ${err.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

