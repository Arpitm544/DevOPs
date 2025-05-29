const mongoose=require('mongoose')

const paymentSchema=new mongoose.Schema({
    bookingId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"bookings"
    },
    payment_id:{
        type:mongoose.Schema.Types.ObjectId
    },
    success:{
        type:String,
    },
    reason:{
        type:String
    },
    Amount:{
        type:number
    }
})

module.exports=new mongoose.model("payment",paymentSchema)