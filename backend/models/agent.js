import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    assignedTasks: [{
        firstName: String,
        phone: Number,
        notes: String
    }]
}, { timestamps: true });

// Export exactly as an object parameter to align perfectly with your routing imports
const Agent = mongoose.model("Agent", agentSchema);
export { Agent };