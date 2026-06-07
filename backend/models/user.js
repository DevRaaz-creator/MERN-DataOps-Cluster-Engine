import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Mongoose Pre-Save hook: Runs automatically before saving a user
userSchema.pre("save", async function () {
    // If the password hasn't been changed, skip hashing
    if (!this.isModified("password")) {
        return; 
    }

    // Generate salt and hash the password using async/await smoothly
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Schema Method: Compares plain-text login passwords with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;