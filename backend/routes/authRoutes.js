import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username, password });

        if (user) {
            res.status(200).json({
                message: "Login successful",
                username: user.username,
                role: user.role
            });
        } else {
            res.status(401).json({ message: "Invalid username or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
