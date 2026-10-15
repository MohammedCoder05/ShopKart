import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true

    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity cannot be less than 1"],
                default: 1
            }
        }
    ]
},{timestamps:true})

const Customer = mongoose.model("Customer",customerSchema)

export default Customer