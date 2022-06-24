exports.site_url = process.env.site_url || "http://localhost:3002";
// exports.api_url = process.env.api_url || "http://localhost:3001";
exports.uploadDir = __dirname.replace(/\\/g, '/') + "/videos/";
exports.publicDir = __dirname.replace(/\\/g, '/') + "/public/";