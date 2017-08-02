'use strict';
const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./webpack.config');

const APP_HOST = '"http://172.18.245.22"';
//const PUBLIC_PATH = "http://img.qi1game.com/h5/group/test/";
//const APP_HOST = '"http://xbly.xingbook.com:4397"';


const BUILD_PATH = path.join(__dirname, "build","theme");
config.output = {
    path: BUILD_PATH,
    filename: 'js/[name]-[hash].js',
    chunkFilename: 'js/[name]-[chunkhash].js',
    // publicPath: PUBLIC_PATH
};

config.module.loaders[config.module.loaders.length - 1] = {
    test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
    loader: 'url-loader?limit=8192&publicPath=../&name=assets/[name]-[hash].[ext]'
}

config.plugins = [
    new ExtractTextPlugin({
        filename: '[name].[hash].css',
        allChunks: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendors',
        filename: 'vendors.[hash].js'
    }),
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }),
    new HtmlWebpackPlugin({
        filename: './index.html',
        template: './src/template/index.ejs',
        inject: false
    }),
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production'),
            'APP_HOST': APP_HOST
        }
    })
]

module.exports = Object.assign({}, config, {
    devtool: 'source-map'
});
