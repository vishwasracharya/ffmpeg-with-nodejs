const fs = require('fs');
const globals = require('../globals');
const uploadDir = globals.uploadDir;

module.exports = () => {
    const files = fs.readdirSync(uploadDir);
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - (1000*60*10));
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = uploadDir + file;
        const fileStats = fs.statSync(filePath);
        const fileDate = new Date(fileStats.mtime);
        if (fileDate < thirtyMinutesAgo) {
            fs.unlinkSync(filePath);
        }
    }
}