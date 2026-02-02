const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @route   GET api/users
// @desc    Get all users (with filters)
// @access  Admin
router.get('/', [auth, verifyAdmin], async (req, res) => {
    try {
        const { role, status } = req.query;
        let query = {};
        if (role) query.role = role.toUpperCase();
        if (status) query.status = status.toUpperCase();

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/users/:id/status
// @desc    Update user status (Approve/Block/Reject)
// @access  Admin
router.put('/:id/status', [auth, verifyAdmin], async (req, res) => {
    try {
        const { status, remarks } = req.body; // status: APPROVED, BLOCKED, REJECTED

        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const oldStatus = user.status;
        user.status = status.toUpperCase();
        await user.save();

        // Audit Log
        const log = new AuditLog({
            adminId: req.user.id,
            action: 'UPDATE_USER_STATUS',
            targetId: user.id,
            targetModel: 'User',
            details: { oldStatus, newStatus: status, remarks }
        });
        await log.save();

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/:id', [auth, verifyAdmin], async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        await User.findByIdAndDelete(req.params.id);

        // Audit Log
        const log = new AuditLog({
            adminId: req.user.id,
            action: 'DELETE_USER',
            targetId: req.params.id,
            targetModel: 'User',
            details: { email: user.email, name: user.name }
        });
        await log.save();

        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
