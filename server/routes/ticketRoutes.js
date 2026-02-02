const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');

// POST /api/tickets/validate
router.post('/validate', async (req, res) => {
    try {
        const { ticketId, token } = req.body; // Accept either ID or token

        if (!ticketId && !token) {
            return res.status(400).json({ message: 'Ticket ID or Token is required' });
        }

        const query = ticketId ? { _id: ticketId } : { token };

        const ticket = await Ticket.findOne(query)
            .populate('passenger', 'name email')
            .populate('booking');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (ticket.status !== 'active') { // Assuming 'active' is the valid status
            let message = 'Ticket is invalid';
            if (ticket.status === 'used') message = 'Ticket already used';
            if (ticket.status === 'cancelled') message = 'Ticket was cancelled';
            if (ticket.status === 'expired') message = 'Ticket expired';

            return res.status(400).json({ message, status: ticket.status });
        }

        // Mark as used
        ticket.status = 'used';
        ticket.usedAt = new Date();
        await ticket.save();

        // Also update booking status to 'completed' (boarded)
        await Booking.findByIdAndUpdate(ticket.booking._id, { status: 'completed' });

        res.json({
            success: true,
            bookingId: ticket.booking._id,
            passengerName: ticket.passenger.name,
            seatNumber: ticket.booking.seats, // Assuming seats is a number, or could be seat assignment if exists
            message: 'Ticket validated successfully'
        });

    } catch (err) {
        console.error('Validation error:', err);
        res.status(500).json({ message: 'Server error during validation' });
    }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('passenger', 'name')
            .populate('trip');
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
