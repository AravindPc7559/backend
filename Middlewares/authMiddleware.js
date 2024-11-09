import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../Utils/generateTokens.js';

/**
 * Verifies the authorization token given in the request headers.
 * @function authMiddleware
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @throws {Error} If there is an error verifying the token.
 * @returns {Promise<void>}
 */
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decode = jwt.verify(token, ACCESS_TOKEN_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }
        return res.status(403).json({ message: 'Invalid token.' });
    }
};

export default authMiddleware;
