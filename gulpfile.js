const argv = require('yargs')
  .boolean('production')
  .argv
const gulp = require('gulp')
const minifyHTML = require('gulp-minify-html')
const exec = require('child_process').exec
const webpack = require('webpack-stream')
const livereload = require('gulp-livereload')

const srcDir = 'src'
const distDir = 'dist'
const entrypoint = `${srcDir}/main.js`

gulp.task('test', function (cb) {
  exec('npm test', function (err, stdout, stderr) {
    console.log(stdout)
    console.log(stderr)
    cb(err)
  })
})

gulp.task('html', function () {
  return gulp.src('index.html')
  .pipe(minifyHTML())
  .pipe(gulp.dest(distDir))
})

gulp.task('scripts', function () {
  return gulp.src(entrypoint)
  .pipe(webpack(require('./.webpack.config.js')(argv.production)))
  .pipe(gulp.dest(distDir))
  .pipe(livereload())
})

gulp.task('default', [ 'test', 'scripts', 'html' ], function () {
  livereload.listen()
  return gulp.watch(srcDir + '/**/*', [ 'scripts' ])
})

