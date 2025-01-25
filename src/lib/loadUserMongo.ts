import connectToDatabase from "./mongodb";
import User from "../models/User";

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        await connectToDatabase();

        const { email } = req.query;

        try {
            const user = await User.findOne({ email });

            if (user) {
                res.status(200).json({ user });
            } else {
                res.status(404).json({ error: "User not found" });
            }
        } catch (error) {
            res.status(500).json({ error: "Failed to load user data" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
