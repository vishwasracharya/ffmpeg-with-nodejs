/* Include gulp and plugins */
let { src, dest, watch, series, parallel, task } = require('gulp');
let javascriptObfuscator = require('gulp-javascript-obfuscator');
let cleancss = require('gulp-clean-css');
let purgecss = require('gulp-purgecss');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify');
let Path = require('path');

/* Paths */
let paths = {
    baseDir : {
        views : './views/',
        css : './public/css/',
        js : './public/js/',
    },
    css : {
        bootstrap: './public/css/bootstrap.css',
    },
    js : {
        bootstrap: './public/js/bootstrap.bundle.js',
    },
    dest : {
        css : './public/dist/css/',
        js : './public/dist/js/',
    }
}

let Files = ['index'];

/* FUNCTIONS THAT WE CAN REUSE */
function cssTask(fileName) {
    return src("./public/css/bootstrap.css")
        .pipe(purgecss({ content: [ paths.baseDir.views + fileName + '.ejs' ] }))
        .pipe(concat(Path.basename(fileName) + '.css'))
        .pipe(cleancss())
        .pipe(dest(paths.dest.css + Path.dirname(fileName)));
}


task('js:minify', () => {
    return src("./public/js/bootstrap.bundle.js")
    .pipe(uglify())
    .pipe(dest(paths.dest.js));
});

task('css:' + Files[0], () => { return cssTask(Files[0]); });
/* Seperate tasks for all views files, this we can use while development */
/* ========================== */
// for (let i = 0; i < Files.length; i++) {
//     task('css:' + Files[i], () => { return cssTask(Files[i]); });
// }
/* ========================== */

// task('watch', () => {
//     for (let i = 0; i < Files.length; i++) {
//         watch(paths.baseDir.views + Files[i] + '.ejs', series( 'css:' + Files[i]));
//     }
// });

// task('default', series('watch'));

/* ====Obfuscate JavaScript===== */
task("js:video-converter", () => {
    return src(paths.baseDir.js + "video-converter.js")
        .pipe(javascriptObfuscator())
        .pipe(dest(paths.dest.js));
});
/* ====Obfuscate JavaScript===== */