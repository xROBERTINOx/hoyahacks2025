import mongoose from "mongoose";

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGO_KEY_CONNECTION_STRING;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

// Define User schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalScore: { type: Number, default: 0 },
});

// Create User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => mongoose);
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error("Failed to connect to MongoDB");
    }
}

// Save or update user
const saveUser = async (email: string, password: string, totalScore: number) => {
    await connectToDatabase();  // Ensure the database is connected

    let user = await User.findOne({ email });

    if (user) {
        // If user exists, update the totalScore
        user.totalScore = totalScore;
        await user.save();
    } else {
        // If user does not exist, create a new user
        user = new User({
            email,
            password,
            totalScore,
        });
        await user.save();
    }

    return user;  // Return the saved user object
};

export default saveUser;
