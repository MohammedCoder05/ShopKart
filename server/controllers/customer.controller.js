import Customer from '../models/customer.model.js'
import bcrypt from 'bcryptjs'
import genToken from '../utils/generateToken.js'
const cookieOptions ={
    httpOnly:true
}
export async function registerCustomer(req,res) {
    try{
        const {fullName,email,password,phone} = req.body
        if(!fullName || !email || !password || !phone){
            return res.status(400).json({message:"All fields are required"})
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password must be atleast 6 characters long"})
        }
        const isEmailValid = await Customer.findOne({email})
        if(isEmailValid){
            return res.status(409).json({message:"Email already registered"})
        }

        const isPhoneValid = await Customer.findOne({phone})
        if(isPhoneValid){
            return res.status(409).json({message:"Phone Number already registered"})
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const newCustomer = await Customer.create({
            fullName,
            email,
            password:hashedPassword,
            phone
        })

        const token = genToken(newCustomer._id)
        res.cookie("token",token,cookieOptions)
        
        
        
        res.status(201).json({"success": true,"message": "Customer registered successfully","customer":newCustomer})
    }catch(err){
        res.status(500).json({message:"Server Crashed",error:err.message})
    }
    
}

export async function loginUser(req,res) {
    try{
        const {phone,password} = req.body

        if(!phone || !password){
            return res.status(400).json({message:"All fields are required"})
        }
        
        const customer = await Customer.findOne({phone})

        if(!customer){
            return res.status(401).json({message:"Customer not registered"})
        }

        const hashedPassword = customer.password;

        const passwordMatched = await bcrypt.compare(password,hashedPassword)

        if(!passwordMatched){
            return res.status(401).json({message:"Wrong Password Entered"})
           
        }

        const token = genToken(customer._id)
        res.cookie("token",token,cookieOptions)

        const safeCustomer = {
            _id: customer._id,
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone
        }

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            customer: safeCustomer
        })


    }catch(err){
        res.status(500).json({message:"Server Crashed",error:err.message})
    }
    
}
export async function getMeIn(req,res){
    res.status(200).json({customer:req.customer})
}

export const logoutUser = (req, res) => {
    res.clearCookie("token", cookieOptions)
    res.status(200).json({ success: true, message: "Logged out successfully" })
}