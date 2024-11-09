import mongoose from "mongoose";
import { changeItemFolder, deleteItemFromS3, uploadItemsToS3 } from "../../Helper/UploadToS3.js"
import videoModel from "../../Model/VideoModel/VideoModel.js";
import CommentModel from "../../Model/CommentModel/CommentModel.js";

/**
 * Posts a video to the database.
 * @function postVideo
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error uploading the video.
 */
const postVideo = async (req, res, next) => {
    const { category, title, description, userId, tags } = req.body;
    const { video, thumbnail } = req.files;


    if (!category || !title || !description || !userId) {
        return res.status(400).json({ message: "Need valid video details" });
    }

    if (!video) {
        return res.status(400).json({ message: "Need valid video!" });
    }



    try {
        const videoUrl = await uploadItemsToS3(video[0], category, "Videos");
        const thumbnailUrl = await uploadItemsToS3(thumbnail[0], undefined, "Thumbnails");

        if (!thumbnailUrl) {
            return req.status(500).json({ message: "Error uploading thumbnail!" });
        }

        if (!videoUrl) {
            return res.status(500).json({ message: "Error uploading video!" });
        }


        const addVideoToDb = await videoModel.create({
            userId,
            title,
            category,
            description,
            videoUrl: videoUrl,
            thumbnail: thumbnailUrl,
            tags
        })

        if (!addVideoToDb) {
            return res.status(500).json({ message: "Error uploading video!" });
        }

        return res.status(200).json({ message: "Video uploaded successfully!", addVideoToDb });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error uploading video!" });
    }
}


/**
 * Retrieves videos by category from the database.
 * @function getVideoByCategory
 * @param {object} req - The request object containing category and limit as parameters.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error retrieving videos.
 */
const getVideoByCategory = async (req, res, next) => {
    const { category, limit } = req.body;
    const itemLimit = limit || 20
    try {
        if (!category) {
            return res.status(400).json({ message: "Need valid category!" });
        }

        const videos = await videoModel.find({ category }).limit(itemLimit);
        if (videos.length) {
            return res.status(200).json({ videos });
        } else {
            return res.status(404).json({ message: "No videos found!" });
        }
    } catch (error) {
        next(error)
    }
}

/**
 * Retrieves videos from the database based on a search query.
 * @function getVideoBySearchQuery
 * @param {object} req - The request object containing searchQuery and limit as parameters.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error retrieving videos.
 */
const getVideoBySearchQuery = async (req, res, next) => {
    try {
        const { searchQuery, limit, category } = req.body
        const videoLimit = limit || 20
        let query;
        try {
            if (!searchQuery) {
                return res.status(400).json({ message: "Need valid search query!" });
            }

            if (category) {
                query = { title: { $regex: searchQuery, $options: "i" }, category }
            } else {
                query = { title: { $regex: searchQuery, $options: "i" } }
            }

            const searchedVideos = await videoModel.find(query).limit(videoLimit);
            if (searchedVideos.length) {
                return res.status(200).json({ searchedVideos });
            } else {
                return res.status(404).json({ message: "No videos found!" });
            }
        } catch (error) {
            next(error)
        }
    } catch (error) {

    }
}




/**
 * Updates a video in the database.
 * @function editVideo
 * @param {object} req - The request object containing the id, title, category, description, tags, videoUrl and thumbnailUrl of the video to be updated.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error updating the video.
 */
const editVideo = async (req, res, next) => {
    try {
        let newVideoUrl;
        let newThumbnailUrl;
        const { id } = req.params
        const { title, category, description, tags, videoUrl, thumbnailUrl } = req.body

        console.log(title, category, description, tags, id, thumbnailUrl)


        if (!id) {
            return res.status(400).json({ message: "Need valid video id!" });
        }

        const document = await videoModel.findById(new mongoose.Types.ObjectId(id))

        if (!document) {
            return res.status(404).json({ message: "Video not found!" });
        }

        if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
            const thumbnailData = await uploadItemsToS3(req.files.thumbnail[0], undefined, "Thumbnails");
            newThumbnailUrl = thumbnailData;
            await deleteItemFromS3(document?.thumbnail)

        }

        if (category && category !== document?.category) {
            newVideoUrl = await changeItemFolder(document?.videoUrl, category, "Videos")
        }

        let parsedTags = [];
        try {
            parsedTags = JSON.parse(tags);
        } catch (err) {
            console.error("Error parsing tags:", err);
            return res.status(400).json({ message: "Invalid tags format!" });
        }

        const updateVideo = await videoModel.findByIdAndUpdate(id, {
            title,
            category,
            description,
            tags: parsedTags,
            thumbnail: JSON.stringify(newThumbnailUrl) ?? null,
            videoUrl: newVideoUrl ?? document?.videoUrl
        })

        if (!updateVideo) {
            return res.status(500).json({ message: "Error updatingXXX video!" });
        } else {
            return res.status(200).json({ message: "Video updated successfully!", updateVideo });
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}


/**
 * Likes a video given a user id and video id.
 * @function likePost
 * @param {object} req - The request object containing userId and id as parameters.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error liking the video.
 */
const likePost = async (req, res, next) => {
    const { id } = req.params
    const { userId } = req.body
    try {
        if (!id || !userId) {
            return res.status(400).json({ message: "Need valid user!" });
        }

        const video = await videoModel.findByIdAndUpdate(id, { $addToSet: { likes: userId } })

        console.log("video", video)

        if (video) {
            return res.status(200).json({ message: "Video liked successfully!", video });
        } else {
            return res.status(404).json({ message: "Video not found!" });
        }
    } catch (error) {
        next(error)
    }
}

/**
 * UnLikes a video given a user id and video id.
 * @function unLikePost
 * @param {object} req - The request object containing userId and id as parameters.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error unLiking the video.
 */
const unLikePost = async (req, res, next) => {
    const { id } = req.params
    const { userId } = req.body
    try {
        if (!id || !userId) {
            return res.status(400).json({ message: "Need valid user!" });
        }

        const video = await videoModel.findByIdAndUpdate(id, { $pull: { likes: userId } })
        if (video) {
            return res.status(200).json({ message: "Video unLiked successfully!", video });
        } else {
            return res.status(404).json({ message: "Video not found!" });
        }
    } catch (error) {
        next(error)
    }
}

/**
 * Adds a comment to a video given a user id, video id and comment.
 * @function addComment
 * @param {object} req - The request object containing userId, id and comment as parameters.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error adding the comment.
 */
const addComment = async (req, res, next) => {
    const { id } = req.params
    const { userId, comment } = req.body
    try {
        if (!id || !userId || !comment) {
            return res.status(400).json({ message: "Need valid user!" });
        }

        const commentData = await CommentModel.create({
            videoId: id,
            userId,
            comment
        })

        if (commentData) {
            const updateVideo = await videoModel.findByIdAndUpdate(id, { $addToSet: { comments: commentData._id } })

            if (updateVideo) {
                return res.status(200).json({ message: "Comment added successfully!", commentData });
            } else {
                return res.status(404).json({ message: "Video not found!" });
            }
        } else {
            return res.status(500).json({ message: "Error adding comment!" });
        }

    } catch (error) {
        next(error)
    }
}

/**
 * Deletes a comment from a video given a comment id and video id.
 * @function deleteComment
 * @param {object} req - The request object containing comment id in params and video id in body.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error deleting the comment or updating the video.
 */
const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params
        const { videoId } = req.body

        if (!id || !videoId) {
            return res.status(400).json({ message: "Need valid comment or video!" });
        }

        const deleteComment = await CommentModel.findByIdAndDelete(id)

        console.log("deleteComment", deleteComment)

        if (deleteComment) {
            const videoData = await videoModel.findByIdAndUpdate(videoId, { $pull: { comments: id } })

            if (videoData) {
                return res.status(200).json({ message: "Comment deleted successfully!", deleteComment });
            } else {
                return res.status(404).json({ message: "Video not found!" });
            }
        } else {
            return res.status(500).json({ message: "Error deleting comment!" });
        }

    } catch (error) {
        next(error)
    }
}

/**
 * Updates a comment given a comment id and new comment.
 * @function editComment
 * @param {object} req - The request object containing comment id in params and new comment in body.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error updating the comment.
 */
const editComment = async (req, res, next) => {
    try {
        const { id } = req.params
        const { newComment } = req.body

        if(!id){
            return res.status(400).json({ message: "Need valid comment id!" });
        }

        console.log("comment", newComment)
        const updatedComment = await CommentModel.findByIdAndUpdate(id, {
            comment:newComment
        })

        if(updatedComment){
            return res.status(200).json({ message: "Comment updated successfully!", updatedComment });
        } else {
            return res.status(404).json({ message: "Comment not found!" });
        }
    } catch (error) {
        next(error)
    }
}

export { postVideo, getVideoByCategory, getVideoBySearchQuery, editVideo, likePost, unLikePost, addComment, deleteComment, editComment }