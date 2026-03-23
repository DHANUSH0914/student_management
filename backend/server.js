import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dns from 'dns';
import connectDB from './config/db.js';

// Node 18+ prefers IPv6 by default, which breaks outgoing Gmail connections on Render's free tier
dns.setDefaultResultOrder('ipv4first');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://student-management-cxv20aojy-phoenixdhanush7-7194s-projects.vercel.app', 'https://student-management-pi-eight.vercel.app'],
    credentials: true
}));
app.use(express.json());

// Import Routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
