const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const browserSync = require('browser-sync').create();
const webpack = require('webpack-stream');
const gulpif = require('gulp-if');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');

let isDev = true;
let isProd = !isDev;

const conf = {
    dest: './build',
};

let webpackConfig = {
    output: {
        filename: 'main.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                },
                exclude: '/node_modules',
            },
        ],
    },
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-source-map' : 'none',
};

function html() {
    return gulp
        .src('./src/index.html')
        .pipe(gulp.dest('./build'))
        .pipe(browserSync.stream());
}

function styles() {
    return gulp
        .src('./src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(
            autoprefixer({
                cascade: false,
            })
        )
        .pipe(gulpif(isProd, cleanCSS({ level: 2 })))
        .pipe(gulp.dest(conf.dest + '/css'))
        .pipe(browserSync.stream());
}

function scripts() {
    return gulp
        .src('./src/js/main.js')
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(conf.dest + '/js'))
        .pipe(browserSync.stream());
}

function images() {
    return gulp
        .src('./src/img/**/*')
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
                }),
            ])
        )
        .pipe(gulp.dest(conf.dest + '/img'));
}

function watch() {
    browserSync.init({
        server: {
            baseDir: './build',
        },
    });

    gulp.watch('./src/sass/**/*.scss', styles);
    gulp.watch('./src/js/**/*.js', scripts);
    gulp.watch('./src/**/*.html', html);
}

function clean() {
    return del(['build/*']);
}

gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('watch', watch);

let build = gulp.series(clean, gulp.parallel(html, styles, scripts, images));

gulp.task('build', build);

gulp.task('dev', gulp.series('build', 'watch'));
