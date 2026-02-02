const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');

// @route   GET api/payments
// @desc    Get all payments
// @access  Admin
router.get('/', [auth, verifyAdmin], async (req, res) => {
    try {
        const payments = await Payment.find().populate('booking').sort({ transactionDate: -1 });
        res.json(payments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/payments/refund/:id
// @desc    Refund a payment
// @access  Admin
router.post('/refund/:id', [auth, verifyAdmin], async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ msg: 'Payment not found' });
        }

        if (payment.status === 'REFUNDED') {
            return res.status(400).json({ msg: 'Payment already refunded' });
        }

        payment.status = 'REFUNDED';
        payment.refundReason = req.body.reason || 'Admin initiated refund';
        await payment.save();

        res.json(payment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
