const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'c21zc19zZWNyZXRfa2V5XzIwMjY=');
            req.user = decoded;
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token validation failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, token is missing' });
    }
};

module.exports = { protect };
