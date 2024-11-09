import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    videoUrl: {
        type: String,
        required: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    uploadDate: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    thumbnail: {
        type: String,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true
});

const videoModel = mongoose.model('videoModel', videoSchema);

export default videoModel;
