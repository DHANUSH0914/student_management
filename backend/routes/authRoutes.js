import express from 'express';
import User from '../models/User.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

// POST /api/auth/forgotpassword
router.post('/forgotpassword', async (req, res) => {
    try {
        const { username, email } = req.body;

        // Step 1: Find by username only
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: `No account found with username "${username}".` });
        }

        // Step 2: Verify the email matches
        if (!user.email) {
            return res.status(400).json({ message: `This account has no email set. Please contact an administrator to update your email via the User Management page.` });
        }
        if (user.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({ message: `The email address you entered does not match our records for this account.` });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Nodemailer transport using Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const frontendUrl = req.headers.origin || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Student Management" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Link',
            text: `Hello ${user.username},\n\nYou requested a password reset.\n\nClick the link below (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
        };

        // Fallback for local testing without real credentials
        if (!process.env.EMAIL_USER) {
            console.log('\n--- FORGOT PASSWORD RESET URL (no email configured) ---');
            console.log(resetUrl);
            console.log('------------------------------------------------------\n');
            return res.status(200).json({ message: `Reset link generated! Check your server console (email not configured yet).` });
        }

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: `Password reset email sent to ${user.email}. Please check your inbox.` });

    } catch (error) {
        res.status(500).json({ message: 'Error processing request.', error: error.message });
    }
});

// POST /api/auth/resetpassword
router.post('/resetpassword', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Reset token is invalid or has expired." });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Your password has been successfully updated." });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error: error.message });
    }
});

export default router;
