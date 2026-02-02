const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');
const DriverDocument = require('../models/DriverDocument');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @route   POST api/documents/upload
// @desc    Upload driver documents
// @access  Private (Driver)
router.post('/upload', auth, async (req, res) => {
    try {
        const { licenseNumber, licenseImage, idProofType, idProofNumber, idProofImage, vehicleRcNumber, vehicleRcImage } = req.body;

        // Check if documents already exist for this user
        let docs = await DriverDocument.findOne({ userId: req.user.id });
        if (docs) {
            // Update existing
            docs.licenseNumber = licenseNumber;
            docs.licenseImage = licenseImage;
            docs.idProofType = idProofType;
            docs.idProofNumber = idProofNumber;
            docs.idProofImage = idProofImage;
            docs.vehicleRcNumber = vehicleRcNumber;
            docs.vehicleRcImage = vehicleRcImage;
            docs.status = 'UPLOADED';
            await docs.save();
        } else {
            // Create new
            docs = new DriverDocument({
                userId: req.user.id,
                licenseNumber,
                licenseImage,
                idProofType,
                idProofNumber,
                idProofImage,
                vehicleRcNumber,
                vehicleRcImage
            });
            await docs.save();
        }

        // Update user status to PENDING if not already
        await User.findByIdAndUpdate(req.user.id, { status: 'PENDING' });

        res.json(docs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/documents/user/:userId
// @desc    Get documents for a user
// @access  Admin
router.get('/user/:userId', [auth, verifyAdmin], async (req, res) => {
    try {
        const docs = await DriverDocument.findOne({ userId: req.params.userId });
        if (!docs) return res.status(404).json({ msg: 'Documents not found' });
        res.json(docs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/documents/:id/verify
// @desc    Verify or Reject documents
// @access  Admin
router.put('/:id/verify', [auth, verifyAdmin], async (req, res) => {
    try {
        const { status, verificationNotes } = req.body; // status: VERIFIED, REJECTED

        let docs = await DriverDocument.findById(req.params.id);
        if (!docs) return res.status(404).json({ msg: 'Documents not found' });

        docs.status = status;
        docs.verificationNotes = verificationNotes;
        await docs.save();

        // If verified, approve the user
        if (status === 'VERIFIED') {
            await User.findByIdAndUpdate(docs.userId, { status: 'APPROVED' });
        } else if (status === 'REJECTED') {
            await User.findByIdAndUpdate(docs.userId, { status: 'REJECTED' });
        }

        // Audit Log
        const log = new AuditLog({
            adminId: req.user.id,
            action: 'VERIFY_DOCUMENTS',
            targetId: docs.id,
            targetModel: 'DriverDocument',
            details: { status, notes: verificationNotes }
        });
        await log.save();

        res.json(docs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
