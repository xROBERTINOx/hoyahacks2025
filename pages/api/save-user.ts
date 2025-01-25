import saveUser from "../../src/lib/saveUserMongo"; // Import saveUser from the correct path

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { email, password, totalScore } = req.body;

        console.log("Received data:", req.body); // To log the received data

        try {
            // Call the saveUser function to save or update user data
            const user = await saveUser(email, password, totalScore);

            res.status(200).json({ message: "User data saved successfully", user });
        } catch (error) {
            console.error("Error saving user:", error);
            res.status(500).json({ error: "Failed to save user data" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
