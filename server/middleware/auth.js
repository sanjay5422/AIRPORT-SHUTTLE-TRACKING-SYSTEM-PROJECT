const jwt = require('jsonwebtoken');

const auth = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = auth;

module.exports.verifyAdmin = function (req, res, next) {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
};
