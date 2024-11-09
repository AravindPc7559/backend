import mongoose from "mongoose";


const CommentSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'videoModel'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    comment: {
        type: String,
        required: true
    }
}, {timestamps: true})

const CommentModel = mongoose.model('Comment', CommentSchema)

export default CommentModel