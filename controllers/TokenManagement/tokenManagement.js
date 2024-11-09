import jwt from 'jsonwebtoken'
import { RefreshTokenModel } from "../../Model/TokenModel/refreshTokenModel.js"
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../../Utils/generateTokens.js'

/**
 * Updates an access token given a refresh token.
 * @function updateAccessToken
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error finding or validating the refresh token or user, or if the refresh token has been revoked.
 */
const updateAccessToken = async (req, res, next) => {
    try {
        const { token } = req.body
        if (!token) return res.sendStatus(401)

        const refreshToken = await RefreshTokenModel.findOne({ token, revoked: false })
        if (!refreshToken || refreshToken.expires < Date.now()) return res.sendStatus(403)

        jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)

            const accessToken = jwt.sign({ id: user.id, userName: user.userName }, ACCESS_TOKEN_SECRET, { expiresIn: "2h" })
            res.json({ accessToken })
        })
    } catch (error) {
        next(error)
    }
}

export { updateAccessToken }