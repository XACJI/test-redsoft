const gulp = require('gulp');// галп
const concat = require('gulp-concat');// конкатенация
const autoprefixer = require('gulp-autoprefixer');// автопрефиксы
const cleanCSS = require('gulp-clean-css');// минификация css
const uglify = require('gulp-uglify');// минификация js
const del = require('del');// очистка
const sass = require('gulp-sass');// sass в css
const sourcemaps = require('gulp-sourcemaps');// создание .css.map
const imagemin = require('gulp-imagemin');// сжатие картинок
const rename = require('gulp-rename');// создание файлом с суффиксом .min
const fileinclude = require('gulp-file-include');// добавление html в html
const gulpif = require('gulp-if');// if
const browserSync = require('browser-sync').create();// слежка за проектом

let current_page = 'index.html' // страница с которой сейчас работаем

let build_folder = 'build'; // собранные файлы
let source_folder = 'src'; // исходные файлы

let path = {
    build: {
        html: build_folder + '/',
        css: build_folder + '/css/',
        js: build_folder + '/js/',
        img: build_folder + '/image/',
        fonts: build_folder + '/fonts/',
    },
    src: {
        html: [source_folder + '/*.html', '!'+source_folder+'/_*.html'],
        css: source_folder + '/css/**/*.css',
        sass: source_folder + '/sass/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/image/**/*.{jpg,png,svg,gif,webp,ico}',
        fonts: source_folder + '/fonts/**/*.{ttf,eot,woff,woff2}',
    },
    watch: {
        html: source_folder + '/*.html',
        css: source_folder + '/css/**/*.css',
        sass: source_folder + '/sass/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/image/**/*.{jpg,png,svg,gif,webp,ico}',
        fonts: source_folder + '/fonts/**/*.{ttf,eot,woff,woff2}',
    },
}

//перетаскиваем шрифты
gulp.task('fonts', () => {
    return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});
//обработка SCSS в CSS
gulp.task('sass', () => {
    return gulp.src(path.src.sass)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: "expanded"}))
    .pipe(autoprefixer({
        cascade: true
    }))
    //.pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(path.build.css))
    .pipe(cleanCSS({
        level: 2
    }))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest(path.build.css+'/min'))
    .pipe(browserSync.stream());
});
gulp.task('css', () => {
    return gulp.src(path.src.css)
    .pipe(autoprefixer({
        cascade: false
    }))
    .pipe(gulp.dest(path.build.css))
    .pipe(gulpif('!**/*.min.css',cleanCSS({level: 2})))
    .pipe(gulpif('!**/*.min.css', rename({suffix: '.min'})))
    .pipe(gulp.dest(path.build.css+'/min'))
    .pipe(browserSync.stream());
});
//обработка JS
gulp.task('js', () => {
    return gulp.src(path.src.js)
    .pipe(gulp.dest(path.build.js))
    .pipe(gulpif('!**/*.min.js', uglify()))
    .pipe(gulpif('!**/*.min.js', rename({suffix: '.min'})))
    .pipe(gulp.dest(path.build.js+'/min'))
    .pipe(browserSync.stream());
});
//обработка Image
gulp.task('img-min', () => {
    return gulp.src(path.src.img)
    .pipe(imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 5,
        svgoPlugins: [
            {
                removeViewBox: false
            }
        ]
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(browserSync.stream());
});
//Добавление html блоков
gulp.task('fileinc', () => {
    return gulp.src(path.src.html)
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
    }))
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
});
//очистка build
gulp.task('del', () => {
    return del(build_folder)
});
//проверка
gulp.task('watch', () => {
    browserSync.init({
        server: {
            baseDir: build_folder,
            index: current_page
        }
    });
    gulp.watch(path.watch.fonts, gulp.series('fonts'))
    gulp.watch(path.watch.sass, gulp.series('sass'))
    gulp.watch(path.watch.css, gulp.series('css'))
    gulp.watch(path.watch.js, gulp.series('js'))
    gulp.watch(path.watch.img, gulp.series('img-min'))
    gulp.watch(path.watch.html, gulp.series('fileinc'))
    gulp.watch(path.build.html).on('change', browserSync.reload)
    gulp.watch(path.watch.sass).on('change', browserSync.reload)
});
//авто проверка изменений
gulp.task('default',  gulp.series('del', 'fileinc', 'fonts', gulp.parallel('sass', 'css', 'js', 'img-min'), 'watch'));