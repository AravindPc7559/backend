import express from "express";
import { addUser, followUser, getUser, getUserData, unFollowUser } from '../../controllers/userManagement/userManagement.js'
import authMiddleware from "../../Middlewares/authMiddleware.js";

const v1Router = express.Router();

v1Router.post('/register', addUser)
v1Router.post('/login', getUser)

v1Router.use(authMiddleware)
v1Router.get('/user/:userId', getUserData)
v1Router.post('/followUser', followUser)
v1Router.post('/unFollowUser', unFollowUser)

export default v1Router;