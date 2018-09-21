/**
 * Build file for client scripts and styles.
 * Copyright (c) 2014-2017 Kaj Magnus Lindberg
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Commands:
 *
 *   gulp          - build everything for development
 *   gulp release  - build and minify everything, for release
 *   gulp watch    - continuously rebuild things that change
 */

var gulp = require('gulp');
var newer = require('gulp-newer');
var typeScript = require('gulp-typescript');
var stylus = require('gulp-stylus');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var del = require('del');
var rename = require("gulp-rename");
var header = require('gulp-header');
var wrap = require('gulp-wrap');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');
var gulpUtil = require('gulp-util');
var es = require('event-stream');
var fs = require("fs");
var execSync = require('child_process').execSync;
var path = require("path");
var preprocess = require('gulp-preprocess');

var watchAndLiveForever = false;
var currentDirectorySlash = __dirname + '/';
var versionFilePath = 'version.txt';


function getVersionTag() {
  var version = fs.readFileSync(versionFilePath, { encoding: 'utf8' }).trim();
  var gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  return version + '-' + gitHash;  // also in Bash and Scala [8GKB4W2]
}


function makeCopyrightAndLicenseBanner() {
  return (
  '/*!\n' +
  ' * Talkyard ' + getVersionTag() + '\n' +
  ' *\n' +
  ' * This file is copyrighted and licensed under the AGPL license.\n' +
  ' * Some parts of it might be licensed under more permissive\n' +
  ' * licenses, e.g. MIT or Apache 2. Find the source code and\n' +
  ' * exact details here:\n' +
  ' *   https://github.com/debiki/debiki-server\n' +
  ' */\n');
}

function makeTranslationsCopyrightAndLicenseBanner() {
  return '/*! Talkyard ' + getVersionTag() + ', license: AGPL. */\n';
}


var thisIsAConcatenationMessage =
  '/*!\n' +
  ' * This file is a concatenation of many different files.\n' +
  ' * Each such file has its own copyright notices. Some parts\n' +
  ' * are released under other more permissive licenses\n' +
  ' * than the AGPL. Files are separated by a "======" line.\n' +
  ' */\n';


var swJsFiles = [
  'target/client/ty-sw-typescript.js'];


// What about using a CDN for jQuery + Modernizr + React? Perhaps, but:
// - jQuery + Modernizr + React is only 33K + 5K + 49K in addition to 160K
//   for everything else, so it's just 90K ~= 50% extra stuff, doesn't matter much?
//   (combined-debiki.min.js.gz is 254K now instead of 157K.
//   combined-debiki.min.css.gz is < 30K (incl Bootstrap) that seems small enough.)
// - I think I've noticed before that cdnjs.com was offline for a short while.
// - If people don't have our version of everything cached already, there
//   might be DNS lookups and SSL handshakes, which delays the page load with
//   perhaps some 100ms? See:
//      https://thethemefoundry.com/blog/why-we-dont-use-a-cdn-spdy-ssl/
// - Testing that fallbacks to locally served files work is boring.
// - Plus I read in comments in some blog that some countries actually sometimes
//   block Google's CDN.
var slimJsFiles = [
      // Place React first so we can replace it at index 0,1,2,3 with the optimized min.js versions.
      'node_modules/react/umd/react.development.js',
      'node_modules/react-dom/umd/react-dom.development.js',
      'node_modules/prop-types/prop-types.js',
      'node_modules/create-react-class/create-react-class.js',
      // COULD_OPTIMIZE SMALLER_BUNDLE or perhaps even remove? add pure CSS anims instead?
      'node_modules/react-transition-group/dist/react-transition-group.js',  // try to move to more-bundle
      'node_modules/react-dom-factories/index.js',
      'target/client/app/utils/calcScrollRectIntoViewCoords.js',
      'client/third-party/smoothscroll-tiny.js',
      'client/third-party/bliss.shy.js',
      'client/app/util/stupid-lightbox.js',
      'node_modules/keymaster/keymaster.js',
      // keymaster.js declares window.key, rename it to window.keymaster instead,
      // see comment in file for details.
      'client/third-party/rename-key-to-keymaster.js',
      'client/third-party/lodash-custom.js',
      'node_modules/eventemitter3/umd/eventemitter3.min.js',
      'node_modules/react-router-dom/umd/react-router-dom.js',
      'client/third-party/tiny-querystring.umd.js',
      'client/third-party/gifffer/gifffer.js',
      'client/third-party/get-set-cookie.js',
      'target/client/app/actions/edit/edit.js',
      'target/client/app/actions/reply.js',
      'target/client/app/if-in-iframe.js',
      //'target/client/app/posts/monitor-reading-progress-unused.js',
      'target/client/app/posts/resize.js',
      //'target/client/app/posts/unread-unused.js',
      'target/client/app/utils/util.js',
      'target/client/app/utils/util-browser.js',
      'client/third-party/popuplib.js',
      'target/client/app/login/login-popup.js',
      'target/client/slim-typescript.js',
      'target/client/app/start-stuff.js'];

var moreJsFiles = [
      'node_modules/react-bootstrap/dist/react-bootstrap.js',
      'node_modules/classnames/index.js',                               // needed by react-select
      'node_modules/react-input-autosize/dist/react-input-autosize.js', // needed by react-select
      'node_modules/react-select/dist/react-select.js',                 // <– react-select
      'node_modules/moment/min/moment.min.js',
      'target/client/more-typescript.js'];

var _2dJsFiles = [
  'client/third-party/jquery-scrollable.js',
  'client/third-party/jquery.browser.js',
  'target/client/app/page/layout-threads.2d.js',
  'target/client/app/page/resize-threads.2d.js',
  'target/client/app/utterscroll/utterscroll-init-tips.js',
  'client/app/utterscroll/utterscroll.js',
  'target/client/2d-typescript.js'];

var staffJsFiles = [
      'target/client/staff-typescript.js'];

var editorJsFiles = [
      // We use two different sanitizers, in case there's a security bug in one of them. [5FKEW2]
      // Find the code that "combines" them here: googleCajaSanitizeHtml [6FKP40]
      'modules/sanitize-html/dist/sanitize-html.js',     // 1
      'client/third-party/html-css-sanitizer-bundle.js', // 2
      'node_modules/markdown-it/dist/markdown-it.js',
      'node_modules/blacklist/dist/blacklist.js',  // needed by what?
      'node_modules/fileapi/dist/FileAPI.html5.js', // don't use the Flash version (w/o '.html5')
      'node_modules/@webscopeio/react-textarea-autocomplete/umd/rta.min.js',
      'client/third-party/diff_match_patch.js',
      'client/third-party/non-angular-slugify.js',
      'target/client/app/editor/mentions-markdown-it-plugin.js',
      'target/client/app/editor/onebox-markdown-it-plugin.js',
      'target/client/editor-typescript.js'];

var jqueryJsFiles = [
  'node_modules/jquery/dist/jquery.js',
  'client/third-party/abbreviate-jquery.js',
  'node_modules/jquery-resizable/resizable.js'];


// For both touch devices and desktops.
// (parten-header.js and parent-footer.js wraps and lazy loads the files inbetween,
// see client/embedded-comments/readme.txt.)
var embeddedJsFiles = [
      // Don't use target/client/... for the parent-header.js and -footer.js, because if processed
      // individually, they contain unbalanced {} braces.
      'client/embedded-comments/parent-header.js',  // not ^target/client/...
      'client/third-party/bliss.shy.js',
      'client/third-party/smoothscroll-tiny.js',
      //'client/third-party/jquery-scrollable.js',
      //'client/third-party/jquery.browser.js',
      //'target/client/embedded-comments/debiki-utterscroll-iframe-parent.js',
      //'target/client/app/utterscroll/utterscroll-init-tips.js',
      'target/client/app/utils/calcScrollRectIntoViewCoords.js',
      'target/client/embedded-comments/iframe-parent.js',
      'client/embedded-comments/parent-footer.js'];  // not ^target/client/...


var nextFileTemplate =
    '\n\n' +
    '//=====================================================================================\n\n' +
    '// Next file: <%= file.path %>\n' +
    '//=====================================================================================\n\n' +
    '<%= contents %>\n';


gulp.task('wrapJavascript', function () {
  // Prevent Javascript variables from polluting the global scope.
  return gulp.src('client/**/*.js')
    .pipe(wrap('(function() {\n<%= contents %>\n}).call(this);'))
    .pipe(gulp.dest('./target/client/'));
});


var serverTypescriptProject = typeScript.createProject({
  target: 'ES5',
  outFile: 'server-bundle.js',
  lib: ['es5', 'es2015', 'dom'],
  // react-dom needed to compile, but isn't actually used, server side.
  types: ['react', 'react-dom', 'lodash', 'core-js'],
});


var serverTypescriptSrc = [
    'client/server/**/*.ts',
    'client/shared/plain-old-javascript.d.ts'];

function compileServerTypescript() {
  var typescriptStream = gulp.src(serverTypescriptSrc)
    .pipe(wrap(nextFileTemplate))
    .pipe(serverTypescriptProject());

  if (watchAndLiveForever) {
    typescriptStream.on('error', function() {
      console.log('\n!!! Error compiling server side TypeScript !!!\n');
    });
  }

  var javascriptStream = gulp.src([
        // Two different sanitizers. [5FKEW2]
        // Needs to be first. There's some missing ';' at the start of the script bug?
        'modules/sanitize-html/dist/sanitize-html.min.js',
        'client/third-party/html-css-sanitizer-bundle.js',
        'node_modules/react/umd/react.production.min.js',
        'node_modules/react-dom/umd/react-dom-server.browser.production.min.js',
        'node_modules/react-dom-factories/index.js',
        'node_modules/create-react-class/create-react-class.min.js',
        // Don't need React CSS transitions server side.
        'node_modules/react-router-dom/umd/react-router-dom.js',
        'client/third-party/tiny-querystring.umd.js',
        'node_modules/markdown-it/dist/markdown-it.min.js',
        'client/third-party/lodash-custom.js',
        'client/third-party/non-angular-slugify.js',
        'client/app/editor/mentions-markdown-it-plugin.js',
        'client/app/editor/onebox-markdown-it-plugin.js'])
      .pipe(wrap(nextFileTemplate));

  return es.merge(typescriptStream, javascriptStream)
      .pipe(concat('server-bundle.js'))
      .pipe(gulp.dest('public/res/'));
}

var swTypescriptProject = typeScript.createProject({
  target: 'ES5',
  outFile: 'ty-sw-typescript.js',
  lib: ['es5', 'es2015', 'dom'],  // dom: fetch() related types
  types: ['core-js'],
  sourceMap: true,     // ??
  inlineSources: true  // include source code in mapping file
});

var slimTypescriptProject = typeScript.createProject({
  target: 'ES5',
  outFile: 'slim-typescript.js',
  lib: ['es5', 'es2015', 'dom'],
  types: ['react', 'react-dom', 'lodash', 'core-js'],
  sourceMap: true,     // ??
  inlineSources: true  // include source code in mapping file
});

var moreTypescriptProject = typeScript.createProject({
  target: 'ES5',
  outFile: 'more-typescript.js',
  lib: ['es5', 'es2015', 'dom'],
  types: ['react', 'react-dom', 'lodash', 'core-js']
});

var _2dTypescriptProject = typeScript.createProject({
  target: 'ES5',
  outFile: '2d-typescript.js',
  lib: ['es5', 'es2015', 'dom'],
  types: ['react', 'react-dom', 'lodash', 'core-js']
});

var staffTypescriptProject = typeScript.createProject({
  target: 'ES5',
  outFile: 'staff-typescript.js',
  lib: ['es5', 'es2015', 'dom'],
  types: ['react', 'react-dom', 'lodash', 'core-js']
});

var editorTypescriptProject = typeScript.createProject({
  target: 'ES5',
  outFile: 'editor-typescript.js',
  lib: ['es5', 'es2015', 'dom'],
  types: ['react', 'react-dom', 'lodash', 'core-js']
});


var swTypescriptSrc = [
  'client/app/model.ts',
  'client/serviceworker/*.ts'];

function compileSwTypescript() {
  var stream = gulp.src(swTypescriptSrc)
    .pipe(wrap(nextFileTemplate))
    .pipe(swTypescriptProject());
  if (watchAndLiveForever) {
    stream.on('error', function() {
      console.log('\n!!! Error compiling service worker TypeScript [TyE5BJW4N] !!!\n');
    });
  }
  return stream.pipe(gulp.dest('target/client/'));
}


var slimTypescriptSrc = [
    'client/shared/plain-old-javascript.d.ts',
    'client/app/**/*.ts',
    '!client/app/**/*.more.ts',
    '!client/app/**/*.2d.ts',
    '!client/app/**/*.editor.ts',
    '!client/app/**/*.staff.ts',
    '!client/app/slim-bundle.d.ts'];

function compileSlimTypescript() {
  var stream = gulp.src(slimTypescriptSrc)
    .pipe(wrap(nextFileTemplate))
    .pipe(slimTypescriptProject());
  if (watchAndLiveForever) {
    stream.on('error', function() {
      console.log('\n!!! Error compiling slim TypeScript [TyE4GDTX8] !!!\n');
    });
  }
  return stream.pipe(gulp.dest('target/client/'));
}


function makeOtherTypescriptSrc(what) {
  return [
    'client/app/**/*.d.ts',
    '!client/app/**/*.' + what + '.d.ts',
    '!client/app/**/' + what + '-bundle-already-loaded.d.ts',
    'client/shared/plain-old-javascript.d.ts',
    'client/app/model.ts',
    'client/app/**/*.' + what + '.ts'];
}

function compileOtherTypescript(what, typescriptProject) {
  var stream = gulp.src(makeOtherTypescriptSrc(what))
    .pipe(wrap(nextFileTemplate))
    .pipe(typescriptProject());
  if (watchAndLiveForever) {
    stream.on('error', function() {
      console.log('\n!!! Error compiling ' + what + ' TypeScript [EsE3G6P8S]!!!\n');
    });
  }
  return stream.pipe(gulp.dest('target/client/'));
}

gulp.task('compileServerTypescript', function () {
  return compileServerTypescript();
});

gulp.task('compileSwTypescript', function () {
  return compileSwTypescript();
});

gulp.task('compileSlimTypescript', function () {
  return compileSlimTypescript();
});

gulp.task('compileMoreTypescript', function () {
  return compileOtherTypescript('more', moreTypescriptProject);
});

gulp.task('compile2dTypescript', function () {
  return compileOtherTypescript('2d', _2dTypescriptProject);
});

gulp.task('compileStaffTypescript', function () {
  return compileOtherTypescript('staff', staffTypescriptProject);
});

gulp.task('compileEditorTypescript', function () {
  return compileOtherTypescript('editor', editorTypescriptProject);
});

gulp.task('compileAllTypescript', function () {
  return es.merge(
      compileServerTypescript(),
      compileSwTypescript(),
      compileSlimTypescript(),
      compileOtherTypescript('more', moreTypescriptProject),
      compileOtherTypescript('2d', _2dTypescriptProject),
      compileOtherTypescript('staff', staffTypescriptProject),
      compileOtherTypescript('editor', editorTypescriptProject));
});


var compileTsTaskNames = [
  'compileServerTypescript',
  'compileSwTypescript',
  'compileSlimTypescript',
  'compileMoreTypescript',
  'compile2dTypescript',
  'compileStaffTypescript',
  'compileEditorTypescript'];

for (var i = 0; i < compileTsTaskNames.length; ++i) {
  var compileTaskName = compileTsTaskNames[i];
  gulp.task(compileTaskName + '-concatScripts', [compileTaskName], function() {
    return makeConcatAllScriptsStream();
  });
}



gulp.task('compileConcatAllScripts', ['wrapJavascript', 'compileAllTypescript'], function() {
  return makeConcatAllScriptsStream();
});



function makeConcatAllScriptsStream() {
  function makeConcatStream(outputFileName, filesToConcat, checkIfNewer) {
    var stream = gulp.src(filesToConcat);
    if (checkIfNewer) {
      stream = stream.pipe(newer('public/res/' + outputFileName));
    }
    return stream
        .pipe(wrap(nextFileTemplate))
        .pipe(concat(outputFileName))
        .pipe(header(thisIsAConcatenationMessage))
        .pipe(header(makeCopyrightAndLicenseBanner()))
        .pipe(gulp.dest('public/res/'));
  }

  return es.merge(
      makeConcatStream('ty-service-worker.js', swJsFiles, 'DoCheckNewer'),
      makeConcatStream('slim-bundle.js', slimJsFiles, 'DoCheckNewer'),
      makeConcatStream('more-bundle.js', moreJsFiles, 'DoCheckNewer'),
      makeConcatStream('2d-bundle.js', _2dJsFiles, 'DoCheckNewer'),
      makeConcatStream('staff-bundle.js', staffJsFiles, 'DoCheckNewer'),
      makeConcatStream('editor-bundle.js', editorJsFiles, 'DoCheckNewer'),
      makeConcatStream('jquery-bundle.js', jqueryJsFiles),
      makeConcatStream('ed-comments.js', embeddedJsFiles),
      gulp.src('node_modules/zxcvbn/dist/zxcvbn.js').pipe(gulp.dest('public/res/')));
}



gulp.task('wrap-javascript-concat-scripts', ['wrapJavascript'], function () {
  return makeConcatAllScriptsStream();
});



gulp.task('enable-prod-stuff', function() {
  // This script isn't just a minified script — it contains lots of optimizations.
  // So we want to use react-with-addons.min.js, rather than minifying the .js ourselves.
  slimJsFiles[0] = 'node_modules/react/umd/react.production.min.js';
  slimJsFiles[1] = 'node_modules/react-dom/umd/react-dom.production.min.js';
  slimJsFiles[2] = 'node_modules/prop-types/prop-types.min.js';
  slimJsFiles[3] = 'node_modules/create-react-class/create-react-class.min.js';
  slimJsFiles[4] = 'node_modules/react-transition-group/dist/react-transition-group.min.js';
});


// Similar to 'minifyScripts', but a different copyright header.
gulp.task('minifyTranslations', ['buildTranslations'], function() {
  return gulp.src(['public/res/translations/**/*.js'])
      .pipe(uglify().on('error', function(err) {
        gulpUtil.log(gulpUtil.colors.red("*** Error ***"), err.toString());
        this.emit('end');
      }))
      .pipe(rename({ extname: '.min.js' }))
      .pipe(header(makeTranslationsCopyrightAndLicenseBanner()))
      .pipe(gulp.dest('public/res/translations/'))
      .pipe(gzip())
      .pipe(gulp.dest('public/res/translations/'));
});


gulp.task('minifyScripts', ['compileConcatAllScripts', 'minifyTranslations'], function() {
  // preprocess() removes all @ifdef DEBUG — however (!) be sure to not place '// @endif'
  // on the very last line in a {} block, because it would get removed, by... by what? the
  // Typescript compiler? This results in an impossible-to-understand "Unbalanced delimiter
  // found in string" error with a meaningless stacktrace, in preprocess().
  return gulp.src(['public/res/*.js', '!public/res/*.min.js'])
      .pipe(preprocess({ context: {} })) // see comment above
      .pipe(uglify().on('error', function(err) {
        gulpUtil.log(gulpUtil.colors.red("*** Error ***"), err.toString());
        this.emit('end');
      }))
      .pipe(rename({ extname: '.min.js' }))
      .pipe(header(makeCopyrightAndLicenseBanner()))
      .pipe(gulp.dest('public/res/'))
      .pipe(gzip())
      .pipe(gulp.dest('public/res/'));
});



gulp.task('compile-stylus', function () {
  var stylusOpts = {
    linenos: true,
    import: [
      currentDirectorySlash + 'client/app/mixins.styl',
      currentDirectorySlash + 'client/app/variables.styl']
  };

  function makeStyleStream(destDir, destFile, sourceFiles) {
    var stream = gulp.src(sourceFiles)
      .pipe(stylus(stylusOpts));

    if (watchAndLiveForever) {
      // This has no effect, why not?
      stream.on('error', function() {
        console.log('\n!!! Error compiling Stylus !!!\n');
      });
    }

    return stream
      .pipe(concat(destFile))
      .pipe(gulp.dest(destDir))
      .pipe(cleanCSS())
      .pipe(header(makeCopyrightAndLicenseBanner()))
      .pipe(rename({ extname: '.min.css' }))
      .pipe(gulp.dest(destDir))
      .pipe(gzip())
      .pipe(gulp.dest(destDir));
  }

  return es.merge(
    makeStyleStream('public/res/', 'styles-bundle.css', [
        'node_modules/bootstrap/dist/css/bootstrap.css',
        'node_modules/@webscopeio/react-textarea-autocomplete/style.css',
        'node_modules/react-select/dist/react-select.css',
        'node_modules/jquery-resizable/resizable.css',
        'client/third-party/stupid-lightbox.css',
        'client/app/theme.styl',
        'client/app/third-party.styl',
        'client/app/page/page.styl',
        'client/app/page/threads.styl',
        'client/app/page/posts.styl',
        'client/app/page/arrows.styl',
        'client/app/page/action-links.styl',
        'client/app/**/*.styl']));
});


function logChangeFn(fileType) {
  return function(event) {
    console.log(fileType + ' file '+ event.path +' was '+ event.type +', running tasks...');
  };
}


gulp.task('watch', ['default'], function() {
  watchAndLiveForever = true;
  gulp.watch(serverTypescriptSrc, ['compileServerTypescript-concatScripts']).on('change', logChangeFn('Server TypeScript'));
  gulp.watch(swTypescriptSrc, ['compileSwTypescript-concatScripts']).on('change', logChangeFn('Service worker TypeScript'));
  gulp.watch(slimTypescriptSrc, ['compileSlimTypescript-concatScripts']).on('change', logChangeFn('Slim TypeScript'));
  gulp.watch(makeOtherTypescriptSrc('more'), ['compileMoreTypescript-concatScripts']).on('change', logChangeFn('More TypeScript'));
  gulp.watch(makeOtherTypescriptSrc('2d'), ['compile2dTypescript-concatScripts']).on('change', logChangeFn('2D TypeScript'));
  gulp.watch(makeOtherTypescriptSrc('staff'), ['compileStaffTypescript-concatScripts']).on('change', logChangeFn('Staff TypeScript'));
  gulp.watch(makeOtherTypescriptSrc('editor'), ['compileEditorTypescript-concatScripts']).on('change', logChangeFn('Editor TypeScript'));

  gulp.watch('client/**/*.js', ['wrap-javascript-concat-scripts']).on('change', logChangeFn('Javascript'));
  gulp.watch('client/**/*.styl', ['compile-stylus']).on('change', logChangeFn('Stylus'));
  gulp.watch('tests/e2e/**/*.ts', ['build-e2e']).on('change', logChangeFn('end-to-end test files'));
  gulp.watch('tests/security/**/*.ts', ['build-security-tests']).on('change', logChangeFn('security test files'));
});

gulp.task('default', ['compileConcatAllScripts', 'compile-stylus', 'minifyTranslations', 'build-e2e', 'build-security-tests'], function () {
});


gulp.task('release', ['enable-prod-stuff', 'minifyScripts', 'compile-stylus'], function() {
});



// ------------------------------------------------------------------------
//  End-to-end Tests
// ------------------------------------------------------------------------


gulp.task('clean-e2e', function () {
  return del([
    'target/e2e/**/*']);
});

gulp.task('compile-e2e-scripts', function() {
  var stream = gulp.src([
        'client/app/constants.ts',
        'client/app/model.ts',
        'tests/e2e/**/*ts'])
      .pipe(typeScript({
        declarationFiles: true,
        module: 'commonjs',
        lib: ['es5', 'es2015', 'dom'],
        types: ['lodash', 'core-js', 'assert', 'node']
      }));
  // stream.dts.pipe(gulp.dest('target/e2e/...')); — no, don't need d.ts files
  if (watchAndLiveForever) {
    stream.on('error', function() {
      console.log('\n!!! Error compiling End-to-End tests TypeScript !!!\n');
    });
  }
  return stream.js
      // .pipe(sourcemaps.write('.', { sourceRoot: '../../../../externalResolve/' }))
      .pipe(gulp.dest('target/e2e'));
});


// Compiles TypeScript code in test/e2e/ and places it in target/e2e/transpiled/,
//
gulp.task('build-e2e', ['clean-e2e', 'compile-e2e-scripts'], function() {
});


// ------------------------------------------------------------------------
//  Translations
// ------------------------------------------------------------------------

gulp.task('cleanTranslations', function () {
  return del([
    'public/res/translations/**/*']);
});

// Transpiles translations/(language-code)/i18n.ts to one-js-file-per-source-file
// in public/res/translations/... .
gulp.task('compileTranslations', function() {
  var stream = gulp.src([
    'translations/**/*.ts'])
    .pipe(typeScript({
      declarationFiles: true,
      lib: ['es5', 'es2015', 'dom'],
      types: ['core-js']
    }));

  if (watchAndLiveForever) {
    stream.on('error', function() {
      console.log('\n!!! Error compiling translations TypeScript !!!\n');
    });
  }
  return stream.js
    .pipe(gulp.dest('public/res/translations'));
});


gulp.task('buildTranslations', ['cleanTranslations', 'compileTranslations'], function() {
});


// ------------------------------------------------------------------------
//  Security tests
// ------------------------------------------------------------------------

gulp.task('clean-security-tests', function () {
  return del([
    'target/security-tests/**/*']);
});

gulp.task('compile-security-tests', function() {
  var stream = gulp.src([
    //'tests/sync-tape.ts',
    'tests/security/**/*.ts'])
    .pipe(typeScript({
      declarationFiles: true,
      module: 'commonjs',
      lib: ['es5', 'es2015', 'dom'],
      types: ['lodash', 'core-js', 'assert', 'node']
    }));
  // stream.dts.pipe(gulp.dest('target/e2e/...')); — no, don't need d.ts files
  if (watchAndLiveForever) {
    stream.on('error', function() {
      console.log('\n!!! Error compiling security tests TypeScript !!!\n');
    });
  }
  return stream.js
  // .pipe(sourcemaps.write('.', { sourceRoot: '../../../../externalResolve/' }))
    .pipe(gulp.dest('target/security-tests'));
});


gulp.task('build-security-tests', ['clean-security-tests', 'compile-security-tests'], function() {
});


// vim: et ts=2 sw=2 tw=0 list
