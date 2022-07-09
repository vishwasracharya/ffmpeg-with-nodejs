const fs = require('fs');

const globals = require('../globals');
const uploadDir = globals.uploadDir;

/* FFMPEG */
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(require('@ffprobe-installer/ffprobe').path);

const uploadAndConvert = async (req, res, next) => {
    req.setTimeout(1000*60*10);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.files) {
        res.status(200).json({
            ok: false,
            error: true,
            status: 200,
            message: 'No files were uploaded.'
        })
        return;
    } else {
        const infs = new ffmpeg;
        console.log(req.files);
        const convertToFormat = req.headers.to;
        console.log(req.headers);
        const video = req.files.file;
        let videoName = video.name.split(" ").join("-").toLowerCase();
        const outputFileName = `${videoName.split(".")[0]}.${convertToFormat}`;
        let videoPath = uploadDir + videoName;

        console.log(outputFileName);
        console.log(videoPath);
        
        /* File Upload */
        video.mv(videoPath, (err) => {
            if (err) {
                console.log("ERROR!!" + err);
                res.status(500).send(err);
                return;
            }
            console.log("File uploaded successfully!");
        });

        /* Conversion Start */
        infs
        .addInput(videoPath)
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
    }
}

const downloadAndDelete = async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const filename = req.body.filename;
    console.log(filename);
    console.log(req.body);
    console.log(uploadDir+filename);
    if (fs.existsSync(uploadDir+filename)) {
        res.download(uploadDir+filename);
        setTimeout(() => {
            fs.unlink(uploadDir+filename, (err) => {
                if (err) {
                    console.log(err);
                    res.status(404).json({
                        ok: false,
                        status: 404,
                        message: 'File does not exist!'
                    });
                    return;
                }
                console.log("File deleted successfully!");
            });
        }, 5000);
    } else {
        console.log("File does not exist");
        res.status(404).json({
            ok: false,
            status: 404,
            message: 'File does not exist!'
        });
    }
}

module.exports = {
    uploadAndConvert, 
    downloadAndDelete
}