const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(require('@ffprobe-installer/ffprobe').path);
const util = require('util');
const path = require("path");
const uuid = require("uuid");
const s3utils = require("../utils/s3");
const fastFolderSize = require('fast-folder-size')
const readFile = util.promisify(fs.readFile)
var dirName = __dirname.replace(/\\/g, '/')
const uploadDir = dirName + "/../videos/"
const processClip = async (video, clip, callback) => {
    var infs = new ffmpeg
    let folderName = uuid.v4();
    let fileName = video.video_url;
    const filePath = dirName + "/../videos/" + fileName
    fs.mkdir(dirName + "/../videos/" + folderName, () => {
        infs.addInput(filePath).videoCodec('libx264').fps(50).audioCodec('aac').setStartTime(clip.start_time).setDuration(clip.end_time - clip.start_time).outputOptions([
            '-master_pl_name master.m3u8',
            '-f hls',
            '-max_muxing_queue_size 1024',
            '-preset ultrafast', '-crf 40',
            '-movflags frag_keyframe+faststart',
            '-hls_list_size 0',
            '-hls_time 15',
            '-hls_segment_filename', `videos/${folderName}/fileSequence%d.ts`
        ]).output(dirName + `/../videos/${folderName}/video.m3u8`)
            .on('start', function (commandLine) {
                console.log('Spawned Ffmpeg with command: ' + commandLine);
            })
            .on('error', function (err, stdout, stderr) {
                console.log('An error occurred: ' + err.message, err, stderr);
                return callback(false)
            })
            .on('progress', function (progress) {
                console.log('Processing: ' + progress.percent + '% done')
            })
            .on('end', async function (err, stdout, stderr) {
                console.log('Finished processing!')
                try {
                    await ffmpeg(filePath).screenshot({ count: 1, timestamps: [`${Math.floor(Math.random() * 99) + 1}%`], filename: "thumb.jpg", folder: dirName + `/../videos/${folderName}/` }).on('end', async function () {
                        console.log("Converted Video")
                        const fastFolderSizeAsync = util.promisify(fastFolderSize)
                        let folderSize = await fastFolderSizeAsync(dirName + `/../videos/${folderName}`)
                        if (!folderSize) folderSize = 0
                        s3utils.uploadDir(uploadDir + folderName, () => {
                            return callback(true, clip._id, folderName, folderSize / 1024, clip.end_time - clip.start_time)
                        })
                    })
                    console.log("Thumbnail created")
                } catch (err) {
                    console.log("Error in generating screenshot! ", err)
                    return callback(false)
                }
            })
            .run()
    })
}
module.exports = {
    processClip
}