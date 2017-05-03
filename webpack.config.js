'use strict';

const path = require('path');
const webpack = require('webpack');
//const BabiliPlugin = require("babili-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = {
  entry: "./app.js",
  output: {
    path: path.join(__dirname, 'public'),
    filename: "build.js"
  },

  module: {
    loaders: [{
      test: /\.js?$/,
      include: path.resolve(__dirname, 'js'),
      exclude: /(node_modules)/,

      loader: 'babel-loader',
      options: {
        presets: ['es2015'],
        //plugins: ['transform-runtime']
      }
    }, {
      test: /\.html$/,
      include: path.resolve(__dirname, 'resources'),
      exclude: /(node_modules)/,

      loader: 'html-loader'
    },
    {
      test: /\.css$/,
      include: path.resolve(__dirname, 'resources'),
      exclude: /(node_modules)/,

      loader: 'style-loader!css-loader'
    }, {
      test:   /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
      include: path.resolve(__dirname, 'resources'),
      exclude: /(node_modules)/,

      loader: 'file-loader?name=img/[name].[ext]'
    }
    ]
  }
};

const devConfig = () => {

  const dev = {
    devServer: {                  // used to edit html and css, 'npm run html'
      contentBase: './public',
      historyApiFallback: true,
     // stats: 'errors-only',
      host: process.env.HOST, // Defaults to `localhost`
      port: process.env.PORT, // Defaults to 8080
    },
    watch: true,
    watchOptions: {
      aggregateTimeout: 100
    },
    devtool: "cheap-inline-module-source-map"

  };

  return Object.assign({}, config, dev)
}

const productionConfig = () => {
  // Compatibility issues between standard ulgify and babel, using an external uglify plugin instead
  //   new webpack.optimize.UglifyJsPlugin({
  //   compress: {
  //     // don't show unreachable variables etc
  //     warnings: false,
  //     drop_console: true,
  //     unsafe: true
  //   }
  // })

  const prod = {
    plugins: [new UglifyJSPlugin()]
  }

  return Object.assign({}, config, prod);
}

module.exports = (env) => {
  return env === 'development' ? devConfig() : productionConfig()
}