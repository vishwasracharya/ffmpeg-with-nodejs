const express = require('express');
const router = express.Router();
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const expressFileUpload = require('express-fileupload');

router.use(expressFileUpload({useTempFiles: true, tempFileDir: './tmp/'}));

/* FFMPEG PATH */
ffmpeg.setFfmpegPath("C:/PATH_Programs/ffmpeg.exe");

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Video Converter Tool',
        message: 'Welcome to my Basic Node Website'
    });
});

router.post('/convert', (req, res, next) => {
    let to = req.body.to;
    let file = req.files.file;
    let fileName = `output.${to}`;

    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    ffmpeg("tmp/" + file.name)
        .withOutputFormat(to)
        .on("end", function (stdout, stderr) {
            console.log("Finished");

            /* Download  */
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;
                console.log('-----------IN DOWNLOAD FUNCTION-----------');
                console.log('File Downloading');

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log('-----------IN DOWNLOAD DELETE FUNCTION-----------');
                    console.log("File deleted");
                });
            });

            /* Delete File From tmp */
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log('-----------IN ON END FUNCTION-----------');
                console.log("File deleted");
            });
        })
        .on("error", function (err) {
            console.log("an error happened: " + err.message);
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName);
});

module.exports = router;