const { environment } = require('@rails/webpacker');
const { resolve } = require('path');

const sassResources = ['./client/app/assets/styles/app-variables.scss'];
const aliasConfig = require('./alias.js');
const rules = environment.loaders;
const fileLoader = rules.get('file');
const cssLoader = rules.get('css');
const ManifestPlugin = environment.plugins.get('Manifest');
const urlFileSizeCutover = 1000; // below 10k, inline, small 1K is to test file loader

// rules
const sassLoaderConfig = {
  loader: 'sass-resources-loader',
  options: {
    resources: sassResources,
  },
};

function addSassResourcesLoader(ruleName) {
  const sassLoaders = rules.get(ruleName).use;
  sassLoaders.push(sassLoaderConfig);
}

addSassResourcesLoader('sass');
addSassResourcesLoader('moduleSass');

environment.splitChunks();

//adding urlLoader
const urlLoader = {
  test: /\.(jpe?g|png|gif|ico|woff)$/,
  use: {
    loader: 'url-loader',
    options: {
      limit: urlFileSizeCutover,
      // NO leading slash
      name: 'images/[name]-[hash].[ext]',
    },
  },
};

debugger
rules.insert('url', urlLoader, { before: 'file' });

const root = resolve(__dirname, '../../client/app');
const resolveUrlLoader = {
  loader: 'resolve-url-loader',
  options: {
    root,
  }
}

const addResolveUrlLoader = (ruleName) => {
  const ruleLoaders = rules.get(ruleName).use;
  const insertPos = ruleLoaders.findIndex((item) => item.loader === 'sass-loader');
  ruleLoaders.splice(insertPos, 0, resolveUrlLoader);
}

addResolveUrlLoader('sass');
addResolveUrlLoader('moduleSass');

// add aliases to config
environment.config.merge(aliasConfig);

module.exports = environment;
