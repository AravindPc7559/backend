import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
        unique: true
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    password: {
        type: String,
        required: true,
    },
    profilePicUrl: {
        type: String
    },
    bio: {
        type: String,
        maxLength: 250
    }
}, {timestamps: true})


userSchema.virtual('followersCount').get(function() {
    return this.followers.length;
});

userSchema.virtual('followingCount').get(function() {
    return this.following.length;
});


export const userModel = mongoose.model('User', userSchema)