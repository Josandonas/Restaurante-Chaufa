/**
 * Session-based Authentication Middleware
 * Similar to Laravel's authentication system
 */

/**
 * Middleware to protect routes - requires authenticated session
 * Redirects to /login if user is not authenticated
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    
    // For API requests, return JSON error
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ 
            error: 'Não autenticado',
            error_es: 'No autenticado'
        });
    }
    
    // For page requests, redirect to login
    return res.redirect('/login');
}

/**
 * Middleware for guest-only routes (login, register)
 * Redirects to /admin if user is already authenticated
 */
function requireGuest(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/admin');
    }
    next();
}

/**
 * Middleware to prevent browser caching of protected pages
 * Ensures browser always validates session with server
 */
function noCacheHeaders(req, res, next) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
}

/**
 * Combined middleware for admin pages
 * Applies no-cache headers and requires authentication
 */
function protectAdminPage(req, res, next) {
    noCacheHeaders(req, res, () => {
        requireAuth(req, res, next);
    });
}

module.exports = {
    requireAuth,
    requireGuest,
    noCacheHeaders,
    protectAdminPage
};
