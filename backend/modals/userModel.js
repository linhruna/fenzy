import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'client'], default: 'client' },
    createdAt: { type: Date, default: Date.now }
})

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;