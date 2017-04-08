var gulp = require("gulp");

var createTsProject = (function () {
    var projects = {};

    return function (fileName) {
        var ts = require("gulp-typescript");

        return projects[fileName] = ts.createProject(fileName);
    };
})();
 
gulp.task("clean", function () {
    var del = require("del");

    return del("lib/**/*");
});

gulp.task("tslint", function () {
    var gulpTslint = require("gulp-tslint");
    var tslint = require("tslint");

    var program = tslint.Linter.createProgram("./tsconfig.json");

    return gulp.src("src/**/*.ts", { base: '.' })
        .pipe(gulpTslint({ program }))
});

gulp.task("tsc", function () {
    var merge = require("merge2");
    var sourcemaps = require("gulp-sourcemaps");

    var project = createTsProject("tsconfig.json");
    var output = project
        .src()
        .pipe(sourcemaps.init())
        .pipe(project());

    return merge([
        output.dts.pipe(gulp.dest("lib")),
        output.js
            .pipe(sourcemaps.write())
            .pipe(gulp.dest("lib"))
    ]);
});

gulp.task("watch", ["tsc"], function () {
    return gulp.watch(["src/**/*.ts"], ["tsc"]);
});

gulp.task("default", callback => {
    var runSequence = require("run-sequence").use(gulp);

    runSequence(
        ["clean", "tslint"],
        ["tsc"],
        callback);
});
