/* jshint node:true */
'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var manifest = require('gulp-manifest');
var sass = require('gulp-sass');
var rev = require("gulp-rev");
var revReplace = require("gulp-rev-replace");

var tsProject = ts.createProject({
  declarationFiles: false,
  noExternalResolve: false,
  target: 'ES5',
  out: 'main.js',
  typescript: require('typescript') // Use local typescript version
});

// Task for building typescript files and outputting a single javascript file
gulp.task('scripts', function() {
  var tsResult = gulp.src('app/scripts/*.ts')
                  .pipe(sourcemaps.init({ debug: true })) // This means sourcemaps will be generated
                  .pipe(ts(tsProject));

  return tsResult.js
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('styles', function() {
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber())
    .pipe(sass({
      style: 'expanded',
      precision: 10
    }).on('error', sass.logError))
    .pipe($.autoprefixer({ browsers: ['last 1 version'] }))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['styles', 'scripts'], function() {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({ port: 35729 }))
    .use(serveStatic('.tmp'))
    .use(serveStatic('app'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function() {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'watch'], function() {
  require('opn')('http://localhost:9000');
});

gulp.task('watch', ['connect'], function() {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  // Watch typescript files
  gulp.watch('app/scripts/**/*.ts', ['scripts']);

  gulp.watch('app/styles/**/*.scss', ['styles']);
});


gulp.task('build:html', ['styles', 'scripts'], function() {
  var assets = $.useref.assets({ searchPath: '{.tmp,app}' });

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref({
      'appcache': function(content, target, options, alternateSearchPath) {
        return '<html lang="da" manifest="manifest.appcache">';
      }
    }))
    .pipe($.if('*.html', $.minifyHtml({ conditionals: true, loose: true, quotes: true })))
    .pipe(gulp.dest('dist/.tmp'));
});

gulp.task('build:extras', function() {
  return gulp.src([
    'app/*.*',
    'app/images/**/*',
    'app/styles/img/*',
    '!app/*.html'
  ], { base: 'app' })
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['build:html', 'build:extras', 'revreplace', 'manifest'], function() {
    return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('manifest', ['revreplace'], function() {
  return gulp.src(['dist/**/*'])
    .pipe(manifest({
      filename: 'manifest.appcache',
      exclude: ['manifest.appcache', 'googlede996898b309d59f.html', 'robots.txt'],
      hash: true,
      preferOnline: false,
      network: ['*'],
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('revision', ['build:html', 'build:extras'], function() {
  return gulp.src(['dist/.tmp/**/*.css', 'dist/.tmp/**/*.js'])
    .pipe(rev())
    .pipe(gulp.dest('dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist'))
});

gulp.task('revreplace', ['revision'], function() {
  var del = require('del');
  var manifest = gulp.src("dist/rev-manifest.json");

  return gulp.src('dist/.tmp/*.html')
    .pipe(revReplace({ manifest: manifest }))
    .pipe(gulp.dest('dist'));
});



gulp.task('default', ['clean'], function() {
  gulp.start('build');
});
