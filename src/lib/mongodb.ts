import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_KEY_CONNECTION_STRING;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI not defined in environment");
}

async function connectToDatabase() {
    try {
        console.log("Attempting MongoDB Connection...");
        console.log("Connection URI (masked):", 
            MONGODB_URI?.replace(/:[^:]*@/, ':****@')
        );

        const connection = await mongoose.connect(MONGODB_URI!, {
            serverSelectionTimeoutMS: 10000, // Increased timeout
        });

        console.log("MongoDB Connected Successfully");
        return connection;
    } catch (error) {
        console.log(error);
        console.error("MongoDB Connection FAILED:", {});
        throw error;
    }
}

export default connectToDatabase;