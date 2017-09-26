var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var gulpIf = require('gulp-if');
var autoprefixer = require('gulp-autoprefixer');
var babelify = require('babelify');
var ghPages = require('gulp-gh-pages');
var cssnano = require('gulp-cssnano');
var cmq = require('gulp-combine-mq');
var browserSync = require('browser-sync');
var cp = require('child_process');
var beeper = require('beeper');
var args = require('yargs').argv;

const production = !!args.production;

const jekyllOpts = ['build'];

if (!production) {
  // jekyllOpts.push('--config', '_config.dev.yml');
}

gulp.task('jekyll-build', function(done) {
  return cp
    .spawn('jekyll', jekyllOpts, {
      stdio: 'inherit'
    })
    .on('close', done);
});

gulp.task('jekyll-rebuild', ['jekyll-build'], function() {
  browserSync.reload();
});

gulp.task('browser-sync', function() {
  browserSync({
    open: false,
    server: {
      baseDir: '_site'
    }
  });
});

gulp.task('scripts', function() {
  var b = browserify({
    entries: './_js/main.js',
    debug: true,
    transform: [[babelify, { presets: ['es2015'] }]]
  });

  return b
    .bundle()
    .on('error', function(err) {
      console.error(err.message);
      beeper();
      this.emit('end');
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulpIf(!production, sourcemaps.init({ loadMaps: true })))
    .pipe(gulpIf(production, uglify()))
    .on('error', gutil.log)
    .pipe(gulpIf(!production, sourcemaps.write('./')))
    .pipe(gulp.dest('./_site/js'))
    .pipe(browserSync.stream())
    .pipe(gulp.dest('./js'));
});

gulp.task('images', function() {
  return gulp.src('./_img/**/*.{jpg,png,svg}').pipe(gulp.dest('./img')); // TODO: compress images
});

// TODO: get styles to beep on sass error
gulp.task('styles', function() {
  return gulp
    .src('./_scss/style.scss')
    .pipe(
      gulpIf(
        !production,
        sourcemaps.init({
          loadMaps: true
        })
      )
    )
    .pipe(
      sass({
        onError: browserSync.notify
      })
    )
    .on('error', sass.logError)
    .pipe(autoprefixer(['last 3 versions', '> 2%', 'ie 10'], { cascade: true }))
    .pipe(gulpIf(!production, sourcemaps.write('./')))
    .pipe(gulpIf(production, cmq()))
    .pipe(gulpIf(production, cssnano({ zIndex: false })))
    .pipe(gulp.dest('_site/css'))
    .pipe(browserSync.stream())
    .pipe(gulp.dest('./css'));
});

gulp.task('watch', function() {
  gulp.watch('_js/**/*.js', ['scripts']);
  gulp.watch('_scss/*.scss', ['styles']);
  gulp.watch('_img/**/*.{jpg,png,svg}', ['images']);
  gulp.watch(
    [
      './*.{html,md}',
      './_layouts/*.html',
      './_includes/*.html',
      './**/*.md',
      './_data/*',
      './_config.yml',
      // HACK: some reason if we try to generically target these folders
      // it causes an infinite rebuild loop
      './{discovery,about,resources}/*.{md,html}'
    ],
    ['jekyll-rebuild']
  );
});

gulp.task('build', ['jekyll-build', 'scripts', 'styles', 'images']);

gulp.task('deploy', function() {
  return gulp.src('./_site/**/*').pipe(
    ghPages({
      branch: 'site'
    })
  );
});

gulp.task('default', ['build', 'browser-sync', 'watch']);
