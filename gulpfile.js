var gulp = require('gulp'),
    open = require('gulp-open'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    template = require('gulp-template-compile'),
    sass = require('gulp-sass')

var tinylr;
var PORT = 9090;
var LIVERELOAD_PORT = 35729;


//script paths
var m = 'src/js/models/**/*.js',
    v = 'src/js/views/**/*.js',
    c = 'src/js/collections/**/*.js',
    r = 'src/js/routers/**/*.js',
    t = 'src/js/templates/**/*.ejs',
    misc = 'src/js/misc/**/*.js'
    misc = 'src/js/misc/**/*.js'
    tmp = './.tmp/',
    dest = 'src/js',
    bowerDir = './src/bower_components/'


//concatenates and shortens all of our files so we can use 1 file during development
gulp.task('scripts', function() {
  return Promise.all([
    gulp.src(m)
        .pipe(concat('models.js'))
        .pipe(gulp.dest(tmp))
        .pipe(rename('models.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(tmp)),
    gulp.src(v)
        .pipe(concat('views.js'))
        .pipe(gulp.dest(tmp))
        .pipe(rename('views.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(tmp)),
    gulp.src(c)
        .pipe(concat('collections.js'))
        .pipe(gulp.dest(tmp))
        .pipe(rename('collections.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(tmp)),
    gulp.src(r)
        .pipe(concat('routers.js'))
        .pipe(gulp.dest(tmp))
        .pipe(rename('routers.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(tmp)),
    gulp.src(t)
        .pipe(template())
        .pipe(concat('templates.js'))
        .pipe(gulp.dest(tmp))
        .pipe(rename('templates.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(tmp)),
    console.log("minimized")
    ]).then(function(){
    gulp.src(['.tmp/templates.min.js', 'src/js/misc/config.js', '.tmp/models.min.js',  '.tmp/collections.min.js', '.tmp/views.min.js', '.tmp/routers.min.js', 'src/js/misc/app.js'])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./src'))
    console.log("concat")
    })
});

gulp.task('templates', function () {
  gulp.src(t)
    .pipe(template())
    .pipe(concat('templates.js'))
    .pipe(uglify())
    .pipe(gulp.dest(tmp));
})

gulp.task('express', function() {
  var express = require('express');
  var app = express();
  app.use(express.static(__dirname + "/src"));
  app.use(require('connect-livereload')({port: LIVERELOAD_PORT}));
  app.listen(PORT, '0.0.0.0');
});

gulp.task('livereload', function() {
  tinylr = require('tiny-lr')();
  tinylr.listen(LIVERELOAD_PORT);
});

function notifyLiveReload(event) {
  var fileName = require('path').relative(__dirname, event.path);
  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}

gulp.task('watch', function() {
  gulp.watch('./**/*.html', notifyLiveReload);
  gulp.watch('./src/js/**/*.js', notifyLiveReload);
  gulp.watch(['./src/js/**/*.js'], ['scripts']);
  gulp.watch(['./src/js/**/*.ejs'], ['scripts']);
  gulp.watch('./src/sass/**/*.scss', ['sass']);
});

gulp.task('sass', function () {
  gulp.src('src/sass/style.scss')
    .pipe(sass({
    	outputStyle: 'compressed',
    	includePaths: [
        bowerDir + '/foundation-sites/scss']
    }).on('error', sass.logError))
    .pipe(gulp.dest('src/styles'));
  // gulp.src('src/sass/theme.scss')
  //   .pipe(sass().on('error', sass.logError))
  //   .pipe(gulp.dest('src/styles'));
  // gulp.src('src/sass/ui.scss')
  //   .pipe(sass().on('error', sass.logError))
  //   .pipe(gulp.dest('src/styles'));
});

gulp.task('app', function(){
  return gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:' + PORT}));
});

gulp.task('default', ['express', 'scripts', 'livereload', 'watch', 'app', "sass"], function() {

});