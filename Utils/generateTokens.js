import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const generateTokens = () => {
    const token = crypto.randomBytes(64).toString('hex');
    return token;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || generateTokens();
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ||generateTokens();


export { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET }