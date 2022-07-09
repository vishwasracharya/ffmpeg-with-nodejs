const keys = require("../keys");
module.exports = (req, res, next) => {
    if (req.headers.authorization && req.headers.origin === keys.site_url) {
        next();
    } else {
        res.status(401).json({
            ok: false,
            status: 401,
            message: 'Unauthorized!'
        });
    }
}