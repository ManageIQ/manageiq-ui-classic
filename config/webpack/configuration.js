// Common configuration for webpacker loaded from config/webpacker.yml

const { resolve } = require('path');
const { env } = require('process');
const { safeLoad } = require('js-yaml');
const { readFileSync } = require('fs');

const configPath = resolve('config', 'webpacker.yml');
const settings = safeLoad(readFileSync(configPath), 'utf8')[env.NODE_ENV];

const { output: outputRoot, i18n, engines } = require('./paths.json');

function removeOuterSlashes(string) {
  return string.replace(/^\/*/, '').replace(/\/*$/, '');
}

function formatPublicPath(host = '', path = '') {
  let formattedHost = removeOuterSlashes(host);
  if (formattedHost && !/^http/i.test(formattedHost)) {
    formattedHost = `//${formattedHost}`;
  }
  const formattedPath = removeOuterSlashes(path);
  return `${formattedHost}/${formattedPath}/`;
}

const output = {
  path: resolve(outputRoot, 'public', settings.public_output_path),
  publicPath: formatPublicPath(env.ASSET_HOST, settings.public_output_path),
};

module.exports = {
  settings,
  env,
  output,
  i18n,
  engines,
};
