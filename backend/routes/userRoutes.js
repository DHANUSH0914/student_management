import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        // the schema toJSON transform already maps _id to id, but we also need to strip passwords here
        const safeUsers = users.map(user => {
            const u = user.toJSON();
            u.password = ""; // clear password
            return u;
        });
        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// POST /api/users
router.post('/', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || username.trim() === '') {
            return res.status(400).json({ message: "Username is required." });
        }
        if (!password || password.length < 4) {
            return res.status(400).json({ message: "Password must be at least 4 characters." });
        }
        if (role !== 'ADMIN' && role !== 'USER') {
            return res.status(400).json({ message: "Role must be ADMIN or USER." });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: `Username '${username}' is already taken.` });
        }

        const newUser = new User({ username, password, role });
        const savedUser = await newUser.save();

        res.status(201).json({
            message: "User created successfully!",
            id: savedUser.id,
            username: savedUser.username,
            role: savedUser.role
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: "User deleted successfully." });
        } else {
            res.status(404).json({ message: `User not found with id: ${req.params.id}` });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
