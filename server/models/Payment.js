const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    paymentMethod: {
        type: String,
        enum: ['CREDIT_CARD', 'PAYPAL', 'CASH', 'WALLET'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
    },
    transactionId: {
        type: String,
        unique: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    refundReason: {
        type: String
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);
