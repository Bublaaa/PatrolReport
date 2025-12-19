import mongoose from "mongoose";

export const connection = async () => {
  try {
    console.log("Mongo Uri:", process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    console.log("Errorr conneciton to MongoDB: ", error.message);
    process.exit(1);
  }
};
