const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');

const env = require('./env');
const config = require('../webpack.config');

const server = new WebpackDevServer(webpack(config), {
  https: false,
  hot: true,
  injectClient: false,
  writeToDisk: true,
  port: env.PORT,
  contentBase: path.join(__dirname, '../build'),
  publicPath: `http://localhost:${env.PORT}`,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  disableHostCheck: true,
});

server.listen(env.PORT);
