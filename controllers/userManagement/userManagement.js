import bcrypt from 'bcrypt'
import { userModel } from '../../Model/UserModel/userModel.js';
import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../../Utils/generateTokens.js';
import { RefreshTokenModel } from '../../Model/TokenModel/refreshTokenModel.js';
/**
 * Creates a new user in the database.
 * @function addUser
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error creating the user.
 */
const addUser = async (req, res, next) => {
  try {
    const { userName, email, password, profilePicUrl, bio } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)
  
    const checkIfEmailExist = await userModel.findOne({ email })
    if (checkIfEmailExist) {
      return res.status(409).json({ message: "Email already exists" })
    }
  
    const user = await userModel.create({
      userName,
      email,
      password: hashedPassword,
      profilePicUrl,
      bio
    })
  
    if (user) {
      res.status(201).json({ message: "User created successfully" })
    } else {
      res.status(400).json({ message: "Invalid user data" })
    }
  } catch (error) {
    next(error)
  }
};

/**
 * Finds a user in the database by email and checks if the password matches.
 * @function getUser
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error finding or validating the user.
 */
const getUser = async (req, res, next) => {
  try {
    const { email, password } = req.body
    
    if(!email || !password) {
      return res.status(400).json({ message: "Need valid email and password!" })
    }

    const user = await userModel.findOne({ email })

    if(user){
      const isMatch  = await bcrypt.compare(password, user.password)
      if(isMatch){
        const accessToken = jwt.sign({id: user._id, userName: user.userName}, ACCESS_TOKEN_SECRET, { expiresIn: "2h" })
        const refreshToken = jwt.sign({id: user._id, userName: user.userName}, REFRESH_TOKEN_SECRET, { expiresIn: "30d" })
        if(refreshToken){
          await RefreshTokenModel.create({
            userId: user._id,
            token: refreshToken,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })
        }
        const { password, ...others } = user._doc
        return res.status(200).json({...others, accessToken, refreshToken})
      } else {
        return res.status(400).json({ message: "Incorrect password" })
      }
    } else {
      return res.status(400).json({ message: "User not found" })
    }
  } catch (error) {
    next(error)
  }
}

/**
 * Gets the data of the user with the given id.
 * @function getUserData
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error finding the user.
 */
const getUserData = async (req, res, next) => {
  try {
    const { userId } = req.params

    const user = await userModel.findById(userId).select('-password')

    if (user) {
      res.status(200).json(user)
    } else {
      return res.status(404).json({ message: 'User not found' });
    }

  } catch (err) {
    next(err)
  }
}

/**
 * Follows a user given a user id and current user id.
 * @function followUser
 * @param {object} req - The request object containing userId and currentUserId as parameters.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error updating the user follow lists.
 */
const followUser = async (req, res, next) => {
  const {userId, currentUserId} = req.body

  if(!userId || !currentUserId) {
    return res.status(400).json({ message: "Need valid user!" });
  }

  try {
    const updateCurrentUser = await userModel.findByIdAndUpdate(currentUserId, {
      $addToSet: {followers: userId}
    })

    const updateUser = await userModel.findByIdAndUpdate(userId, {
      $addToSet: {following: currentUserId}
    })


    if(updateCurrentUser && updateUser) {
      return res.status(200).json({ message: "User followed successfully!" });
    } else {
      return res.status(404).json({ message: "User not found!" });
    }

  } catch (error) {
    next(error)
  }

}

/**
 * UnFollows a user given a user id and current user id.
 * @function unFollowUser
 * @param {object} req - The request object containing userId and currentUserId as parameters.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error unFollowing the user.
 */
const unFollowUser = async (req, res, next) => {
  const {userId, currentUserId} = req.body

  if(!userId || !currentUserId) {
    return res.status(400).json({ message: "Need valid user!" });
  }

  try {
    const updateCurrentUser = await userModel.findByIdAndUpdate(currentUserId, {
      $pull: {followers: userId}
    })

    const updateUser = await userModel.findByIdAndUpdate(userId, {
      $pull: {following: currentUserId}
    })


    if(updateCurrentUser && updateUser) {
      return res.status(200).json({ message: "User unFollowed successfully!" });
    } else {
      return res.status(404).json({ message: "User not found!" });
    }

  } catch (error) {
    next(error)
  }

}


export { addUser, getUser, getUserData, followUser, unFollowUser }