var gulp = require('gulp');

var chug = require('gulp-chug');
var clean = require('gulp-rimraf');
var jshint = require('gulp-jshint');
var nodefy = require('gulp-nodefy');
var rename = require('gulp-rename');
var render = require('gulp-dust-render');
var uglify_ = require('gulp-uglify');

var pretty = {
    mangle : false,
    output : { beautify : true },
    compress : false,
    preserveComments : 'all'
};
var optimal = {};
var uglify = function () { return uglify_(pretty); };

gulp.task('watch', function () {
    gulp.watch('src/**/*.js');
    gulp.watch([
         'src/template/decode/**/*',
        '!src/template/decode/script{,/**}'
    ], ['reader']);
});

gulp.task('build', ['cgr', 'context']);

gulp.task('reader', ['buildReader'], function () {
    return gulp.src('src/reader/script/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('lib/reader'));
});

gulp.task('buildReader', function () {
    return gulp.src('src/reader/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['build'] }))
});

//gulp.task('ci', function () {
//    return gulp.src('./src/reader/gulpfile.js', { read : false })
//        .pipe(chug({ tasks : ['ci'] }));
//});

gulp.task('clean', ['cleanReader'], function () {
    return gulp.src('lib', { read : false })
        .pipe(clean());
});

gulp.task('cleanReader', function () {
    return gulp.src('src/reader/gulpfile.js')
        .pipe(chug({ tasks : ['clean'] }))
});

gulp.task('cgr', ['types', 'scope', 'constants', 'readers']);

gulp.task('nonscope', ['types', 'constants', 'readers']);

['constants', 'readers', 'types'].forEach(function (processor) {
    gulp.task(processor, ['reader'], function () {
        return gulp.src('schema/nodes.json')
            .pipe(render(
                require('./lib/reader/' + processor)
            ))
            .pipe(uglify())
            .pipe(rename(processor+'.js'))
            .pipe(jshint())
            .pipe(jshint.reporter('default'))
            .pipe(nodefy())
            .pipe(gulp.dest('lib/cgr'));
    });
});

gulp.task('scope', ['reader'], function () {
    return gulp.src('schema/files.json')
        .pipe(render(
            require('./lib/reader/scope')
        ))
        .pipe(uglify())
        .pipe(rename('scope.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(nodefy())
        .pipe(gulp.dest('lib/cgr'));
});

gulp.task('context', function () {
    gulp.src('context/**/*.js')
        .pipe(uglify())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(nodefy())
        .pipe(gulp.dest('lib/context'));
});
