const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true

    },
    mobile:{
        type:Number,
        required:true,
        unique:true
    },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }] // Reference to booking documents

})
const Register = new mongoose.model("Register",schema);
module.exports= Register;