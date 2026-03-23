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
        const { username, password, role, email } = req.body;

        if (!username || username.trim() === '') {
            return res.status(400).json({ message: "Username is required." });
        }
        if (!password || password.length < 4) {
            return res.status(400).json({ message: "Password must be at least 4 characters." });
        }
        if (role !== 'ADMIN' && role !== 'USER') {
            return res.status(400).json({ message: "Role must be ADMIN or USER." });
        }
        if (!email || email.trim() === '') {
            return res.status(400).json({ message: "Email is required." });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: `Username '${username}' is already taken.` });
        }

        const newUser = new User({ username, password, role, email });
        const savedUser = await newUser.save();

        res.status(201).json({
            message: "User created successfully!",
            id: savedUser.id,
            username: savedUser.username,
            role: savedUser.role,
            email: savedUser.email
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    try {
        const { username, password, role, email } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (username) user.username = username;
        if (role && (role === 'ADMIN' || role === 'USER')) user.role = role;
        if (email) user.email = email;
        if (password && password.length >= 4) user.password = password;

        const updated = await user.save();
        res.json({
            message: 'User updated successfully!',
            id: updated.id,
            username: updated.username,
            role: updated.role,
            email: updated.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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
