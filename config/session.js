const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { pool } = require('./database');

// Session store configuration
const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 minutes
    expiration: 86400000, // 24 hours
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, pool);

// Session configuration
const sessionConfig = {
    key: 'chaufa_session',
    secret: process.env.SESSION_SECRET || 'chaufa-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000, // 24 hours
        httpOnly: true,
        // Detecta automaticamente: false para HTTP (dev), true para HTTPS (prod)
        // Ambientes funcionam identicamente para seu protocolo
        secure: process.env.USE_HTTPS === 'true',
        sameSite: 'lax'
    }
};

module.exports = { sessionConfig, sessionStore };
