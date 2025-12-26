const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            error: 'Token não fornecido',
            error_es: 'Token no proporcionado'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                error: 'Token inválido ou expirado',
                error_es: 'Token inválido o expirado'
            });
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };
