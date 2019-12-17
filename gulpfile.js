const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
const concatenate = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const minify = require('gulp-minifier');

const origin = 'src';
const destination = 'app';

function clean(cb) {
	del(destination);
	cb();
}

function html(cb) {
	src(`${origin}/**/*.html`).pipe(dest(destination));
	cb();
}

function css(cb) {
	src(`${origin}/css/main.css`)
		.pipe(
			autoprefixer({
				overrideBrowserlist: ['last 2 versions'],
				cascade: false
			})
		)
		.pipe(dest(`${destination}/css`));
	cb();
}

function minify(cb) {
	src(`${origin}/**/*`)
		.pipe(
			minify({
				minify: true,
				minifyHTML: {
					collapseWhitespace: true,
					conservativeCollapse: true
				},
				minifyJS: {
					sourceMap: true
				},
				minifyCSS: true
			})
		)
    .pipe(dest(`${destination}`));
  cb();
}

function icons(cb) {
  src(`node_modules/@fortawesome/fontawesome-free/webfonts/*`)
    .pipe(dest(`${destination}/css/webfonts`));
  cb();
}

function js(cb) {
  src(`${origin}/js/lib/**/*.js`)
    .pipe(dest(`${destination}/js/lib`));
  
  src(`${origin}/js/script.js`)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest(`${destination}/js`));
  cb();
}

function server(cb) {
  browserSync.init({
    notify: false,
    open: false,
    server: {
      baseDir: destination
    }
  });
  cb();
}

function watcher(cb) {
  watch(`${origin}/**/*.html`).on('change', series(html, browserSync.reload));
  watch(`${origin}/**/*.css`).on('change', series(css, browserSync.reload));
  watch(`${origin}/**/*.js`).on('change', series(js, browserSync.reload));
  cb();
}

exports.basic = series(parallel(html, icons, css, js), watcher);
exports.test = series(clean, parallel(html, icons, css, js), server, watcher);
exports.production = series(clean, parallel(html, icons, css, js), minify, server, watcher);
exports.default = series(parallel(html, icons, css, js), server, watcher);