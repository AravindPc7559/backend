import express from 'express'
import { getVideoByCategory, getVideoBySearchQuery, postVideo, editVideo, likePost, unLikePost, addComment, deleteComment, editComment } from '../../controllers/VideoManagement/VideoManagementController.js'
import authMiddleware from '../../Middlewares/authMiddleware.js'
import multer from 'multer'

const storage = multer.memoryStorage();
const upload = multer({ storage });
const videoManagementRoute = express.Router()

videoManagementRoute.use(authMiddleware)

videoManagementRoute.post('/postVideo', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), postVideo);
videoManagementRoute.post('/getVideoByCategory', getVideoByCategory)
videoManagementRoute.post('/getVideoBySearchQuery', getVideoBySearchQuery)
videoManagementRoute.patch("/editPost/:id", upload.fields([{ name: 'thumbnail', maxCount: 1 }]), editVideo)
videoManagementRoute.patch("/likePost/:id", likePost)
videoManagementRoute.patch("/unLikePost/:id", unLikePost)
videoManagementRoute.post("/addComment/:id", addComment)
videoManagementRoute.post("/deleteComment/:id", deleteComment)
videoManagementRoute.patch("/editComment/:id", editComment)

export default videoManagementRoute