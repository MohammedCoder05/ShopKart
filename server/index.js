import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import customerRoutes from "./routes/customer.routes.js"
import productRoutes from "./routes/product.routes.js"
import wishlistRoutes from "./routes/wishlist.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import orderRoutes from "./routes/order.routes.js"
import cors from "cors";
const app = express()

const PORT = 8004

dotenv.config()

mongoose.connect(process.env.uri).then(() => {
    console.log('DB Started');

}).catch((err) => {
    console.log(err.message);

})
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use("/customer", customerRoutes)
app.use("/products", productRoutes)
app.use("/wishlist", wishlistRoutes)
app.use("/cart", cartRoutes)
app.use("/orders", orderRoutes)
app.get("/", (req, res) => {
    res.send("Server Onnnnn")
})
app.listen(PORT, () => {
    console.log("Server Started")
})