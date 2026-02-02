const mongoose = require('mongoose');
const crypto = require('crypto');

const TicketSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    passenger: { // Copied from booking for easier access
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        unique: true,
        default: () => crypto.randomBytes(16).toString('hex')
    },
    status: {
        type: String,
        enum: ['active', 'used', 'expired', 'cancelled'],
        default: 'active'
    },
    usedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ticket', TicketSchema);
