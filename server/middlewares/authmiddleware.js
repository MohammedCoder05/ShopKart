import jwt from 'jsonwebtoken'
import Customer from '../models/customer.model.js'
export async function isAuthenticated(req, res, next) {
    try {
        let token = req.cookies?.token

        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1]
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Not authenticated" })
        }

        const decoded = jwt.verify(token, process.env.jwt_secret)
        const userId = decoded.customerId || decoded.id || decoded._id

        const customer = await Customer.findById(userId).select("-password")

        if (!customer) {
            return res.status(401).json({ success: false, message: "Customer not found" })
        }

        req.customer = customer
        req.user = customer

        next()

    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" })
    }
}