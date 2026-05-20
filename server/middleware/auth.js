const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token || 
                  req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'spendwise-secret'
        );
        req.userId = decoded.id;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;
