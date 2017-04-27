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

// Default build for environmental build. //

// Compile scss into css
gulp.task("sass-scripts", function() {
    return gulp.src(["./build/scss/juxtapose.scss"])
        .pipe(sass())
        .pipe(gulp.dest("./build/css/"))
        .pipe(gulp.dest("./dist/css/"))
        .pipe(browserSync.stream());
});

// Compile juxtapose
gulp.task("juxtapose", function() {
  gulp.src("./build/js/juxtapose.js")
    .pipe(codekit())
    .pipe(gulp.dest("./build/js/"))
    .pipe(gulp.dest("./dist/js/"));  
});

// Compile angular
gulp.task("angular-scripts", function() {
  gulp.src("./build/js/angular/*.js")
    .pipe(gulp.dest("./dist/js/angular/"));  
});

gulp.task("js-watch", ["juxtapose"]);

// Check HTML
gulp.task("checkHTML", function() {
  gulp.src("./build/index.html")
    .pipe(gulp.dest("./dist/"));
});

gulp.task("useref", function() {
    return gulp.src("./build/*.html")
	    .pipe(useref())
	    // .pipe(sourcemaps.init({loadMaps: true}))
	    // Minifies only if it's a JavaScript file
	    .pipe(gulpIf("*.js", uglify()))
	    // Minifies only if it's a CSS file
    	.pipe(gulpIf('*.css', cssnano()))
    	// .pipe(sourcemaps.write('./dist/'))
	    .pipe(gulp.dest("./dist/"));
});

gulp.task("demo-build", function() {
    return gulp.src("./build/*.html")
        .pipe(useref({
            changeCSS: function (content, target, options, alternateSearchPath) {
                // do something with `content` and return the desired HTML to replace the block content
                return content.replace('/css/', target);
            },
            changeJS: function (content, target, options, alternateSearchPath) {
                // do something with `content` and return the desired HTML to replace the block content
                return content.replace('/js/', target);
            },
            changeBase: function (content, target, options, alternateSearchPath) {
                // do something with `content` and return the desired HTML to replace the block content
                return content.replace('/', target);
            },
        }))
        // .pipe(sourcemaps.init({loadMaps: true}))
        // Minifies only if it's a JavaScript file
        // .pipe(gulpIf("*.js", uglify()))
        // Minifies only if it's a CSS file
        // .pipe(gulpIf('*.css', cssnano()))
        // .pipe(sourcemaps.write('./dist/'))
        .pipe(gulp.dest("./docs/"));
});

// Static server //
gulp.task('browserWatch', function() {
    browserSync.init({
            server:{
                baseDir: ["./", "./build"]
            },
            browser: "C://Users//pw8g08//AppData//Local//Google//Chrome SxS//Application//chrome.exe",
            middleware: [historyApiFallback()]
            // open: false
    });
    gulp.watch("./build/scss/**/*.scss", ["sass-scripts"]);
    gulp.watch("./build/js/**/*.js", ["js-watch"]);
    gulp.watch("./build/js/**/*.js").on("change", browserSync.reload);
    gulp.watch("./build/**/*.html", ["checkHTML"]);
    gulp.watch("./build/*.html").on("change", browserSync.reload);
});

// Default serve //
gulp.task("serve", function(browserWatch){
    runSequence("sass-scripts", "juxtapose", "checkHTML", "browserWatch")
});

// Main tasks to run from command line //
gulp.task("default", ["serve"]);
gulp.task("build", ["useref", "serve"]);
// gulp.task("docs", function() {
//     runSequence("less-scripts", "storytour", "angular-scripts", "config-script", "app-script",
//                 ["demo-json", "demo-partials"],
//                 "demo-build",
//                 "demo-serve"
//     );
// });