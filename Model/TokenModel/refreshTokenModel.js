import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    expires: { type: Date, required: true },
    revoked: { type: Boolean, default: false }
}, {timestamps: true});

export const RefreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);
