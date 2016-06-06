'use strict';
/*
 * simply sync and optimize icons from material-design-icons project: https://github.com/google/material-design-icons.git
 */
const path = require('path');

const mapStream = require('map-stream');
const vfs = require('vinyl-fs');

function rename(file, cb) { // removing prefix in filename
  console.log(`[copying...] ${file.path}`);
  const arr = file.path.split(path.sep);
  const targetName = arr[arr.length - 1].replace(/^ic_/, '')
    .replace(/_48px\.svg/, '.svg')
    .replace(/_/g, '-');
  arr[arr.length - 1] = targetName;
  file.path = arr.join(path.sep);
  cb(null, file);
}

function cleanAttrs(file, cb) {
  const contents = file.contents.toString('utf8')
    .replace(/\swidth="\d+(px)?"/, '')
    .replace(/\sheight="\d+(px)?"/, '');

  file.contents = new Buffer(contents);
  cb(null, file);
}

module.exports = (source, target/* , options */) => {
  // location: ${source}/*/svg/design/*.svg
  console.log(target);
  vfs.src('./*/svg/design/*_48px.svg', {
    cwd: source,
    cwdbase: true,
    dot: true
  })
    .pipe(mapStream(rename))
    .pipe(mapStream(cleanAttrs))
    .pipe(vfs.dest(target, {
      base(file){
        const arr = file.path.split(path.sep);
        file.path = path.resolve(source, `./${arr[arr.length - 1]}`);
        return target;
      },
      cwd: './'
    }));
};