import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database.
 * @function connectDB
 * @async
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        // Establishes a connection to the MongoDB database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB connected');
    } catch (error) {
        // If there is an error, prints the error message
        console.log(error);
    }
}

export default connectDB