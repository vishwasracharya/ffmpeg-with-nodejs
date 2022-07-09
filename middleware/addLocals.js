const getPathFromUrl = require("../controllers/getPathFromUrl");
const keys = require("../keys");
module.exports = (req, res, next) => {
    res.locals.site_url = keys.site_url;
    res.locals.slug = getPathFromUrl(req.url);
    return next();
}