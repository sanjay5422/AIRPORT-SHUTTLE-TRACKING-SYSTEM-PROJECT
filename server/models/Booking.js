const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    seats: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled', 'completed'],
        default: 'booked'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    adminNotes: {
        type: String
    },
    pickupLocation: {
        type: String, // e.g., "Terminal 1", "Hotel A" - should match a stop name on the route
        required: true
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
