const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'targetModel'
    },
    targetModel: {
        type: String,
        enum: ['User', 'Shuttle', 'Route', 'Booking', 'Payment']
    },
    details: {
        type: Object
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
