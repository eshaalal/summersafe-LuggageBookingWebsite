// booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    luggageItems: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;