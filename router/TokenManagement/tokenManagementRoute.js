import express from "express";
import { updateAccessToken } from "../../controllers/TokenManagement/tokenManagement.js";

const tokenManagementRoute = express.Router();

tokenManagementRoute.post('/updateAccessToken', updateAccessToken)

export default tokenManagementRoute