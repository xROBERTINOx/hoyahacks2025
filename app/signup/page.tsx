"use client";

import { useState } from "react";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [totalScore, setTotalScore] = useState(0); // Default score is 0
    const [message, setMessage] = useState("");

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
    
        const response = await fetch("/api/save-user", {  // Ensure the path is correct here
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, totalScore }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
            setMessage("User created successfully!");
        } else {
            setMessage(data.error || "An error occurred.");
        }
    };
    
    return (
        <div className="signup-container">
            <h1>Sign Up</h1>
            <form onSubmit={handleSignUp}>
            <div>
                <label htmlFor="email">Email (Username):</label>
                <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ backgroundColor: "white", color: "black" }}
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ backgroundColor: "white", color: "black" }}
                />
            </div>
            <div>
                <label htmlFor="totalScore">Total Score:</label>
                <input
                type="number"
                id="totalScore"
                name="totalScore"
                value={totalScore}
                onChange={(e) => setTotalScore(Number(e.target.value))}
                style={{ backgroundColor: "white", color: "black" }}
                />
            </div>
            <button type="submit">Sign Up</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
};

export default SignUp;
