import express from 'express'
import {getMeIn, loginUser, registerCustomer,logoutUser} from '../controllers/customer.controller.js'
import { isAuthenticated } from '../middlewares/authmiddleware.js'
const customerRoutes = express.Router()

customerRoutes.post("/register",registerCustomer)
customerRoutes.post("/login",loginUser)
customerRoutes.get("/getme",isAuthenticated,getMeIn)
customerRoutes.post("/logout", logoutUser)
export default customerRoutes

