/* Modules */
const express = require('express');
const router = express.Router();

const cors = require("cors");
// const multer  = require('multer');
const expressFileUpload = require('express-fileupload');

/* Constants */
const keys = require('../keys');
// const upload = multer({ dest: 'tmp/' })

/* Controllers */
const converterController = require('../controllers/converterController');
const deleteOldFiles = require('../controllers/deleteOldFiles');
const addLocals = require('../middleware/addLocals');

/* Middleware */
const authorization = require('../middleware/authorization');

/* Global Middleware */
router.use(expressFileUpload({ useTempFiles: true, tempFileDir: './tmp/' }));
router.use(addLocals);

/* USEFUL FUNCTIONS */
deleteOldFiles();

let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Video Converter Tool | Playstory',
    });
});

router.post('/convertOriginalFile', authorization, cors(corsOptions), converterController.uploadAndConvert);
router.post('/downloadDeleteConvertedFile', authorization, cors(corsOptions), converterController.downloadAndDelete);

module.exports = router;