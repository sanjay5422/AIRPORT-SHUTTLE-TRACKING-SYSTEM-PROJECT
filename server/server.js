const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"], // React ports
        methods: ["GET", "POST"]
    }
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// Force restart for env update
console.log('Server restarted. CORS origins:', ["http://localhost:3000", "http://localhost:3001"]);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/fleet', require('./routes/fleet'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

const activeDrivers = new Map(); // Store driverId -> socketId

// Socket.io Connection
const LiveLocation = require('./models/LiveLocation');

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Allow client to join specific channels based on role/ID
    socket.on('join-channel', ({ role, userId }) => {
        if (role) {
            socket.join(role); // e.g., 'DRIVER', 'PASSENGER'
            console.log(`Socket ${socket.id} joined room: ${role}`);
        }
        if (userId) {
            socket.join(userId); // Personal channel
            console.log(`Socket ${socket.id} joined personal room: ${userId}`);
        }
        socket.join('ALL'); // Broadcast channel
    });

    socket.on('join-dashboard', () => {
        socket.join('admin-dashboard');
        console.log('Admin joined dashboard room');
    });

    socket.on('driver-location', async (locationData) => {
        // ... existing driver-location logic ...
        const { driverId, lat, lng, heading, speed } = locationData;

        // Broadcast to admins
        io.to('admin-dashboard').emit('fleet-update', {
            driverId,
            lat,
            lng,
            heading,
            speed,
            timestamp: new Date()
        });

        // Update DB (Throttled upsert recommended in prod, direct here for demo)
        try {
            await LiveLocation.findOneAndUpdate(
                { driver: driverId },
                {
                    driver: driverId,
                    location: { type: 'Point', coordinates: [lng, lat] },
                    heading,
                    speed,
                    lastUpdated: new Date()
                },
                { upsert: true, new: true }
            );
        } catch (err) {
            console.error("Error updating location:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Share IO instance with routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
