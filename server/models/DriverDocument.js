const mongoose = require('mongoose');

const DriverDocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    licenseImage: {
        type: String, // URL/Path
        required: true
    },
    idProofType: {
        type: String, // Passport, Aadhar, etc.
        required: true
    },
    idProofNumber: {
        type: String,
        required: true
    },
    idProofImage: {
        type: String,
        required: true
    },
    vehicleRcNumber: {
        type: String
    },
    vehicleRcImage: {
        type: String
    },
    status: {
        type: String,
        enum: ['UPLOADED', 'VERIFIED', 'REJECTED'],
        default: 'UPLOADED'
    },
    verificationNotes: {
        type: String
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DriverDocument', DriverDocumentSchema);
