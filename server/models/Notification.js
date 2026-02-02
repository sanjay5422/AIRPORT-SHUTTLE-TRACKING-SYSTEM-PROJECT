const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null if it's a broadcast to many
    },
    roleTarget: {
        type: String,
        enum: ['ALL', 'DRIVER', 'PASSENGER', 'ADMIN'],
        default: null // Used for broadcasts
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['INFO', 'WARNING', 'CRITICAL', 'SUCCESS'],
        default: 'INFO'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date // Optional auto-cleanup
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
