import mongoose from "mongoose";

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000;

async function connectDB() {
  let retries = MAX_RETRIES;
  let currentDelay = INITIAL_RETRY_DELAY;
  console.log(process.env.NODE_ENV);
  const mongoURI =
    process.env.NODE_ENV === "production"
      ? process.env.MONGO_URI
      : process.env.MONGO_URI_DEV;

  if (!mongoURI) {
    console.error("Mongo URI is missing for this environment");
    process.exit(1);
  }

  while (retries > 0) {
    try {
      await mongoose.connect(mongoURI);
      console.log("MongoDB connected successfully");
      return;
    } catch (err) {
      retries -= 1;

      console.error(`MongoDB connection failed. ${retries} retries left.`);
      console.error(`Error: ${err.message}`);

      if (retries === 0) {
        console.error("Max retries reached. Exiting application...");
        process.exit(1);
      }

      console.log(`Waiting ${currentDelay / 1000} seconds before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= 2;
    }
  }
}

export default connectDB;
