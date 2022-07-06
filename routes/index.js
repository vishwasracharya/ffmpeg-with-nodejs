const express = require('express');
const router = express.Router();
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile)
const keys = require('../keys');
const multer  = require('multer')
const upload = multer({ dest: 'tmp/' })

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(require('@ffprobe-installer/ffprobe').path);

// const ffmpeg = require('ffmpeg');
const expressFileUpload = require('express-fileupload');

// let dirName = __dirname.replace(/\\/g, '/')
// const uploadDir = dirName + "/../videos/"
const uploadDir = keys.uploadDir;
console.log(uploadDir);

router.use(expressFileUpload({ useTempFiles: true, tempFileDir: './tmp/' }));

/* FFMPEG PATH */
// ffmpeg.setFfmpegPath("C:/PATH_Programs/ffmpeg.exe");

/* USEFUL FUNCTIONS */
function getPathFromUrl(url) {
    return url.split("?")[0];
}

router.get('/', addLocals, function (req, res, next) {
    res.render('index', {
        title: 'Video Converter Tool | Playstory',
        message: 'Welcome to my Basic Node Website'
    });
});

router.post('/testing-route', (req, res, next) => {
    console.log("Testing Route");
    res.sendStatus(200);
});

router.post('/convertOriginalFile', async (req, res, next) => {
    req.setTimeout(1000000);
    if (!req.files) {
        res.status(200).json({
            ok: false,
            error: true,
            status: 200,
            message: 'No files were uploaded.'
        })
        return;
    } else {
        console.log(req.files);
        const convertToFormat = req.headers.to;
        console.log(req.headers);
        const video = req.files.file;
        let videoName = video.name.split(" ").join("-").toLowerCase();
        const outputFileName = `${videoName.split(".")[0]}.${convertToFormat}`;
        let videoPath = uploadDir + videoName;

        console.log(outputFileName);
        console.log(videoPath);
        
        video.mv(videoPath, (err) => {
            if (err) {
                console.log("ERROR!!" + err);
                res.status(500).send(err);
                return;
            }
            console.log("File uploaded successfully!");
        });

        ffmpeg()
        .addInput(videoPath)
        .videoCodec('libx264') 
        .output(uploadDir + outputFileName)
        .withOutputFormat(convertToFormat)
        .on('start', (commandLine) => {
            console.log(`Spawned Ffmpeg with command: ${commandLine}`);
        })
        .on('error', (err) => {
            console.log('an error happened: ' + err.message);
            fs.unlink(videoPath, (err) => {
                // if (err) throw err;
                console.log("File deleted successfully!");
            });
            res.status(200).json({
                ok: false,
                error: true,
                status: 200,
                message: err.message
            })
        })
        .on('progress', function (progress) {
            console.log('Processing: ' + progress.percent + '%')
        })
        .on('end', () => {
            fs.unlink(videoPath, (err) => {
                // if (err) throw err;
                console.log("File deleted successfully!");
            });
            console.log('Processing finished!');
            console.log('conversion finished');
            res.status(200).json({
                ok: true,
                error: false,
                status: 200,
                message: 'File Converted successfully!'
            })
        })
        .run();
        // .saveToFile(keys.publicDir + outputFileName);
    }
})

router.post('/downloadDeleteConvertedFile', (req, res, next) => {
    const filename = req.body.filename;
    console.log(req.body);
    console.log(uploadDir+filename);
    res.download(uploadDir + filename, (err) => {
        if (err) console.log(err);
        console.log("File downloaded successfully!");
        fs.unlink(uploadDir + filename, (err) => {
            if (err) console.log(err);
            console.log("File deleted successfully!");
        });
    });
    // // res.sendStatus(200);
});

router.post('/transcode', addLocals, (req, res, next) => {
    let data = req.body
    // let to = req.body.to;
    let file = req.files.file;
    console.log(file)
    // let fileName = `output.${to}`;
    // var command = new ffmpeg();
    console.log(data)

    // file.mv("tmp/" + file.name, function (err) {
    //     if (err) return res.sendStatus(500).send(err);
    //     console.log("File Uploaded successfully");
    // });

    // ffmpeg("tmp/" + file.name)
    //     .withOutputFormat(to)
    //     .on('start', function(commandLine){
    //         console.log('Started processing' + commandLine);
    //     })
        // .on('progress', function (progress) {
        //     console.log('Processing: ' + progress.percent + '% done')
        // })
    //     .on("end", function (stdout, stderr) {
    //         console.log("Finished");

    //         /* Download  */
    //         res.download(__dirname + fileName, function (err) {
    //             if (err) throw err;
    //             console.log('File Downloaded Successfully');

    //             fs.unlink(__dirname + fileName, function (err) {
    //                 if (err) throw err;
    //                 console.log("Output Video File deleted");
    //             });
    //         });

    //         /* Delete File From tmp */
    //         fs.unlink("tmp/" + file.name, function (err) {
    //             if (err) throw err;
    //             console.log('-----------IN ON END FUNCTION-----------');
    //             console.log("Original Video File deleted");
    //         });
    //     })
    //     .on("error", function (err) {
    //         console.log("ERROR!!! " + err.message);
    //         fs.unlink("tmp/" + file.name, function (err) {
    //             if (err) throw err;
    //             console.log("Original Video File deleted");
    //         });
    //     })
    //     .saveToFile(__dirname + fileName);
});

function addLocals(req, res, next) {
    res.locals.site_url = keys.site_url;
    res.locals.slug = getPathFromUrl(req.url);
    return next();
}

module.exports = router;