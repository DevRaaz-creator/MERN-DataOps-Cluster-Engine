import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; 
import multer from "multer";
import * as XLSX from "xlsx";
import { Agent } from "../models/agent.js"; 

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ==========================================
// 1. ADMIN AUTHENTICATION ENDPOINT
// ==========================================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please enter all fields" });
        }

        if (email !== "martin@gmail.com" || password !== "12345") {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { email: email, role: "admin" },
            process.env.JWT_SECRET || "fallback_secret_key",
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Authentication successful",
            token,
            admin: { email }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error during login" });
    }
});

// ==========================================
// 2. AGENT MANAGEMENT ENDPOINTS
// ==========================================

// @desc    Create / Add a New Agent
router.post("/add-agent", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: "All agent fields are required" });
        }

        const existingAgent = await Agent.findOne({ email });
        if (existingAgent) {
            return res.status(400).json({ success: false, message: "Agent email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAgent = new Agent({
            name,
            email,
            mobile: phone, 
            password: hashedPassword,
            assignedTasks: [] 
        });

        await newAgent.save();
        return res.status(201).json({ success: true, message: "Agent profile registered successfully!", agent: newAgent });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error creating agent profile" });
    }
});

// @desc    Get All Registered Agents and Tasks
router.get("/get-agents-tasks", async (req, res) => {
    try {
        const agents = await Agent.find({});
        return res.status(200).json(agents);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error fetching active agents matrix" });
    }
});

// @desc    Delete An Agent Profile
router.delete("/delete-agent/:id", async (req, res) => {
    try {
        const agentId = req.params.id;
        const deletedAgent = await Agent.findByIdAndDelete(agentId);

        if (!deletedAgent) {
            return res.status(404).json({ success: false, message: "Agent profile not found" });
        }

        return res.status(200).json({ success: true, message: "Agent successfully dropped from cluster assignment" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error during agent profile erasure" });
    }
});

// @desc    Clear all tasks/leads from all agents manually
router.post("/clear-all-tasks", async (req, res) => {
    try {
        await Agent.updateMany({}, { $set: { assignedTasks: [] } });
        return res.status(200).json({ success: true, message: "All work bundles successfully flushed!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error clearing assignment logs." });
    }
});

// ==========================================
// 3. TASK UPLOAD & SEQUENTIAL SPLITTING ENGINE
// ==========================================
router.post("/upload-tasks", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload a file." });
        }

        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
            return res.status(400).json({ success: false, message: "Accepted formats: .csv, .xlsx, .xls" });
        }

        const agents = await Agent.find({});
        if (agents.length === 0) {
            return res.status(400).json({ success: false, message: "No operational agents discovered." });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(worksheet);

        if (rawRows.length === 0) {
            return res.status(400).json({ success: false, message: "The spreadsheet contains no records." });
        }

        const parsedRows = rawRows.map(row => ({
            firstName: row.FirstName || row.firstName || row.name || "N/A",
            phone: Number(row.Phone || row.phone || 0),
            notes: row.Notes || row.notes || ""
        }));

        const totalItems = parsedRows.length;
        const totalAgents = agents.length;
        const baseItemsPerAgent = Math.floor(totalItems / totalAgents);
        const remainder = totalItems % totalAgents;

        let currentItemIndex = 0;

        for (let i = 0; i < totalAgents; i++) {
            const allocationCount = baseItemsPerAgent + (i < remainder ? 1 : 0);
            const agentChunk = parsedRows.slice(currentItemIndex, currentItemIndex + allocationCount);
            currentItemIndex += allocationCount;

            await Agent.findByIdAndUpdate(agents[i]._id, {
                $set: { assignedTasks: agentChunk }
            });
        }

        return res.status(200).json({
            success: true,
            message: `Success! Distributed ${totalItems} items across ${totalAgents} agents.`,
            totalDistributedRows: totalItems
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal distribution matrix crash." });
    }
});

export default router;