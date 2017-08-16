const gulp = require('gulp')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const browserify = require('browserify')
const babelify = require('babelify')
const sourcemaps = require('gulp-sourcemaps')

function handleError (err) {
  console.error(err.toString())
  this.emit('end')
}

function transpile (src, dest) {
  const b = browserify(src, {debug: true})
  b.transform(babelify, {
    sourceMaps: true,
    presets: [
      'flow',
      ['env', {
        'targets': {
          'browsers': ['Chrome >= 45']}}]]
  })
  // run automatically on every update
  b.bundle()
      .on('error', handleError)
      .pipe(source(src))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(concat(dest)) // output filename
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('app/chrome/'))
}

// ---------- tasks
gulp.task('chrome.index', () => transpile('src/chrome.index.js', 'index.js'))
gulp.task('chrome.devtools', () => transpile('src/chrome.devtools.js', 'devtools.js'))
gulp.task('browser', ['chrome.index', 'chrome.devtools'])

gulp.task('node', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel({presets: ['flow']}))
    .on('error', handleError)
    .pipe(gulp.dest('lib'))
})

gulp.task('copy', function () {
  return gulp.src('resources/**/*.*')
             .pipe(gulp.dest('app/chrome/'))
})

// build everything once, probably for production
gulp.task('once', ['browser', 'node', 'copy'])
// watch and rebuild everything on change
gulp.task('watch', () => {
  gulp.watch(['src/**/*.js', 'resources/**/*.*'], ['browser', 'node', 'copy'])
      .on('change', event => console.log(`\nFile ${event.path} was ${event.type}, running tasks...`))
})
