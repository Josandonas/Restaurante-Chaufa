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
        // Em produção com Nginx reverse proxy, secure deve ser 'auto'
        // Isso permite que Express detecte HTTPS via X-Forwarded-Proto header
        secure: process.env.NODE_ENV === 'production' ? 'auto' : false,
        sameSite: 'lax'
    },
    proxy: process.env.NODE_ENV === 'production' // Trust proxy headers in production
};

module.exports = { sessionConfig, sessionStore };
