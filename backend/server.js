import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

// Initialize configuration layers
dotenv.config();
const app = express();

// ==========================================
// MIDDLEWARE SYSTEM CONFIGURATION
// ==========================================

// Fulfills Task 1 & 3: Enable strict Cross-Origin routing
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Crucial: Body parsers to extract JSON payloads sent from the frontend forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Maps user auth pipelines, agent profiles management, and task routing matrices
app.use('/api/users', authRoutes);

// Base sanity node connection path target check
app.get('/', (req, res) => {
    res.status(200).send("MERN Machine Test Backend Processing Core Online.");
});

// ==========================================
// DATABASE LAYERS & BOOTUP SEQUENCE
// ==========================================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_machine_test')
    .then(() => {
        console.log("=================================================");
        console.log("⚡ MongoDB connected securely to Cloud Cluster Shard!");
        console.log(`🚀 Server officially processing traffic on Port: ${PORT}`);
        console.log("🕵️ CORS Access Rules explicitly open for: http://localhost:5173");
        console.log("=================================================");
        
        // Start engine execution loop listeners once database connection clears
        app.listen(PORT, () => {
            console.log(`System Control Engine listening live on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection initialization failure:", err.message);
    });