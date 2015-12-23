var historyFallback = require('connect-history-api-fallback');
var log = require('connect-logger');
var yargs = require('yargs');
var proxyMiddleware = require('http-proxy-middleware');
var sync = require('browser-sync').create();
var defaultOpenPath = '';

yargs.option('files', {
  describe: 'array of file paths to watch',
  type: 'array'
});

var argv = yargs.argv;
var openPath = getOpenPath();
var options =
  {
    port: argv.port || 3000,
    proxy: argv.proxy,
    openPath: openPath,
    files: argv.files ? argv.files : [
      openPath + '/**/*.html',
      openPath + '/**/*.css',
      openPath + '/**/*.js'
    ],
    baseDir: argv.baseDir || './',
    fallback: '/' + openPath + '/index.html'
  };

if (argv.verbose) {
  console.log('options', options);
}

function getOpenPath() {
  var src = argv.open || defaultOpenPath;
  if (!src) {
    return '.'
  }
  return src;
}

// build middleware.
var middleware = [log()];

// create a proxy if there is a proxy param.
if(options.proxy) {
  var proxy = proxyMiddleware('/api', {
      target: options.proxy
    });
  middleware.push(proxy);
}
middleware.push(historyFallback({ index: options.fallback }));

sync.init({
  server: {
    port: options.port,
    baseDir: options.baseDir,
    middleware: middleware
  },
  files: options.files,
});
