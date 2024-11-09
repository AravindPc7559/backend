import { PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../Utils/awsConfig.js";
import dotenv from 'dotenv';
dotenv.config();

const bucketName = 'videoappstorage';


/**
 * Uploads a given data to an S3 bucket with a given category and entity type.
 * @param {Buffer} data - The data to be uploaded.
 * @param {string} category - The category of the item.
 * @param {string} entity - The type of the item (Videos or Thumbnails).
 * @returns {string} The URL of the uploaded item.
 * @throws {Error} If there is an error uploading the item.
 */
const uploadItemsToS3 = async (data, category, entity) => {
    const VideoFolderName = `${entity}/${category}_videos/`; 
    const imageFolderName = `${entity}/`;
    const itemKey = `${entity ===  "Videos" ? VideoFolderName : imageFolderName}${data?.originalname}`

    const uploadStream = {
        Bucket: bucketName,
        Key: itemKey,
        Body: data.buffer,
        ContentType: data.mimetype,
    };

    try {
        await s3.send(new PutObjectCommand(uploadStream));
        const Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${itemKey}`
        return Url;
    } catch (error) {
        throw new Error(error);
    }
}


/**
 * Moves an item from its current folder to a new category-specific folder within an S3 bucket.
 * @param {string} videoUrl - The URL of the item to be moved.
 * @param {string} category - The new category for the item.
 * @param {string} entity - The type of the item (e.g., Videos).
 * @returns {string} The new URL of the item after being moved.
 * @throws {Error} If there is an error moving the item.
 */
const changeItemFolder = async (videoUrl, category, entity) => {
    try {
        const s3Key = extractS3Key(videoUrl);
        const VideoFolderName = `${entity}/${category}_videos/${s3Key.fileName}`; 


        const copyParams = {
            Bucket: bucketName,
            CopySource: encodeURIComponent(`${bucketName}/${s3Key.fullPath}`),
            Key: VideoFolderName
        };

        await s3.send(new CopyObjectCommand(copyParams))


        await deleteItemFromS3(videoUrl)

        const Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${VideoFolderName}`

        return Url
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

const deleteItemFromS3 = async (itemUrl) => {
    console.log(itemUrl)
    const s3Key = extractS3Key(itemUrl);

    console.log("s3Key.fullPath", s3Key.fullPath)

    const deleteParams = {
        Bucket: bucketName,
        Key: s3Key.fullPath
    };

    await s3.send(new DeleteObjectCommand(deleteParams));
}


export {uploadItemsToS3, changeItemFolder, deleteItemFromS3}


/**
 * Extracts the S3 key details from a given URL.
 * @function extractS3Key
 * @param {string} url - The URL from which to extract the S3 key.
 * @returns {object|null} An object containing the full path and file name if the URL is valid, null otherwise.
 * @throws {Error} If the URL is invalid.
 */
function extractS3Key(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.substring(1); 
        const parts = pathname.split('/');

        const fullPath = pathname;

        const fileName = parts[parts.length - 1];

        return { fullPath, fileName };
    } catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}
