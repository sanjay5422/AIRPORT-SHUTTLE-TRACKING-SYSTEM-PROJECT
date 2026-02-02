const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');

// @route   GET api/notifications
// @desc    Get notifications for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Get personal notifications OR broadcasts for their role OR 'ALL'
        const notifications = await Notification.find({
            $or: [
                { recipient: req.user.id },
                { roleTarget: req.user.role },
                { roleTarget: 'ALL' }
            ]
        }).sort({ createdAt: -1 }).limit(50);

        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/notifications/broadcast
// @desc    Send a notification to a group or all users
// @access  Admin
router.post('/broadcast', [auth, verifyAdmin], async (req, res) => {
    const { title, message, type, targetRole } = req.body;
    // targetRole: 'ALL', 'DRIVER', 'PASSENGER'

    try {
        const notification = new Notification({
            roleTarget: targetRole || 'ALL',
            title,
            message,
            type: type || 'INFO'
        });

        await notification.save();

        // Emit socket event
        const io = req.app.get('io'); // Ensure we set 'io' in app.set() in server.js
        if (io) {
            if (targetRole === 'ALL') {
                io.emit('notification', notification);
            } else {
                io.to(targetRole).emit('notification', notification);
            }
        }

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ msg: 'Not found' });

        // Only direct recipients can modify the 'isRead' flag on the main doc
        // For broadcasts, handling 'read' status per user is complex (requires a separate Join table). 
        // For this MVP, we will only mark personal notifications as read in DB.
        // Client-side can handle local 'read' state for broadcasts.

        if (notification.recipient && notification.recipient.toString() === req.user.id) {
            notification.isRead = true;
            await notification.save();
        }

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
