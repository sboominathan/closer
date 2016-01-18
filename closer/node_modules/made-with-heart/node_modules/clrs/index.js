var stylus = require('stylus')
  , drfColor = drfColor || {}
  ;

drfColor.path = __dirname + 'lib';

drfColor.middleware = function(str, path) {
  return stylus(str).set('filename', path).use(css());
}

drfColor.css = function() {
  return function (style) {
    style.include(__dirname);
    style.import('lib');
  };
}

module.exports = drfColor;