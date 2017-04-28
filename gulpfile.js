var gulp        = require("gulp");
var	gutil = require("gulp-util");
var browserSync = require("browser-sync").create();
var sass        = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var codekit = require("gulp-codekit");
var uglify = require("gulp-uglify");
var cssnano = require("gulp-cssnano");
var gulpIf = require("gulp-if");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var useref = require("gulp-useref");
var runSequence = require('run-sequence');
var historyApiFallback = require('connect-history-api-fallback');

//**** variables ****//
var env = process.env.NODE_ENV;
var source, directory, images;

gulp.task("set-variables", function() {
    source = './build/';
    directory = env === 'development' ? './build/' : env === 'production' ? './dist/' : env === 'docs' ? './docs/' : 'development';
});

// Compile scss into css
gulp.task("sass-scripts", function() {
    return gulp.src([source + "scss/juxtapose.scss"])
        .pipe(sass())
        .pipe(gulp.dest(directory + "css/"))
        .pipe(browserSync.stream());
});

// Compile juxtapose
gulp.task("juxtapose", function() {
  gulp.src(source + "js/juxtapose.js")
    .pipe(codekit())
    .pipe(gulp.dest(directory + "js/"))
});

gulp.task("js-watch", ["juxtapose"]);

// Check HTML
gulp.task("checkHTML", function() {
  gulp.src(source + "index.html")
    .pipe(gulp.dest(directory));
});

gulp.task("useref", function() {
    return gulp.src(source + "index.html")
        .pipe(useref())
	    // .pipe(sourcemaps.init({loadMaps: true}))
	    // Minifies only if it's a JavaScript file
	    .pipe(gulpIf("*.js", uglify()))
	    // Minifies only if it's a CSS file
    	.pipe(gulpIf("*.css", cssnano()))
    	// .pipe(sourcemaps.write('./dist/'))
	    .pipe(gulp.dest(directory));
});

// gulp.task("demo-build", function() {
//     return gulp.src(source + "index.html")
//         .pipe(useref({
//             changeCSS: function (content, target, options, alternateSearchPath) {
//                 // do something with `content` and return the desired HTML to replace the block content
//                 return content.replace('/css/', target);
//             },
//             changeJS: function (content, target, options, alternateSearchPath) {
//                 // do something with `content` and return the desired HTML to replace the block content
//                 return content.replace('/js/', target);
//             },
//             changeBase: function (content, target, options, alternateSearchPath) {
//                 // do something with `content` and return the desired HTML to replace the block content
//                 return content.replace('/', target);
//             },
//             changeImages: function (content, target, options, alternateSearchPath) {
//                 // do something with `content` and return the desired HTML to replace the block content
//                 return content.replace(images, target);
//             },
//         }))
//         // .pipe(sourcemaps.init({loadMaps: true}))
//         // Minifies only if it's a JavaScript file
//         .pipe(gulpIf("*.js", uglify()))
//         // Minifies only if it's a CSS file
//         .pipe(gulpIf('*.css', cssnano()))
//         // .pipe(sourcemaps.write('./dist/'))
//         .pipe(gulp.dest(directory));
// });

// Static server //
gulp.task('browserWatch', function() {
    browserSync.init({
            server:{
                baseDir: ["./", directory]
            },
            browser: "C://Users//pw8g08//AppData//Local//Google//Chrome SxS//Application//chrome.exe",
            middleware: [historyApiFallback()]
            // open: false
    });
    gulp.watch(source + "scss/**/*.scss", ["sass-scripts"]);
    gulp.watch(source + "js/**/*.js", ["js-watch"]);
    gulp.watch(source + "js/**/*.js").on("change", browserSync.reload);
    gulp.watch(source + "**/*.html", ["checkHTML"]);
    gulp.watch(source + "*.html").on("change", browserSync.reload);
});

gulp.task('env-dev', function() {
    return env = 'development';
});

gulp.task('env-prod', function() {
    return env = 'production';
});

gulp.task('env-docs', function() {
    return env = 'docs';
});

// Default serve //
// gulp.task("serve", function(browserWatch){
//     runSequence("sass-scripts", "juxtapose", "checkHTML", "browserWatch")
// });

// Default //
gulp.task("default", ["env-dev"], function() {
    runSequence("set-variables", "sass-scripts", "juxtapose", "checkHTML", "browserWatch")
});

// build for production //
gulp.task('build', ['env-prod'], function() {
    // maybe here manipulate config object  
    // config.paths.src.scripts = config.paths.deploy.scripts;
    runSequence("set-variables", "sass-scripts", "juxtapose", "checkHTML", "useref", "browserWatch");
});

// build for docs //
gulp.task('docs', ['env-docs'], function() {
    // maybe here manipulate config object  
    // config.paths.src.scripts = config.paths.deploy.scripts;
    runSequence("set-variables", "sass-scripts", "juxtapose", "checkHTML", "useref", "browserWatch");
});

// Main tasks to run from command line //
// gulp.task("default", ["set-dev", "set-variables", "serve"]);
// gulp.task("build", ["set-prod", "set-variables", "useref", "serve"]);