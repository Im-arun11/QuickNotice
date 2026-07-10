import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quicknotice');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not crash the server in dev mode if MongoDB is not running locally,
    // let it run so other mock routes might still function or they can see active endpoints.
    console.warn('Warning: Proceeding with server boot without active database connection. Make sure local MongoDB is running.');
  }
};
