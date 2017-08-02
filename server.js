/**
 * Created by hsu on 16-8-15.
 */

'use strict';
process.title = process.argv[2];

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const httpProxy = require('http-proxy');
const proxyConfig = require('./proxy');

const devServerPort = 3222;

const devSever = new WebpackDevServer(webpack(config), {
    host: "0.0.0.0",
    contentBase: './dist/',
    publicPath:'',
    historyApiFallback: true,
    hot: false,
    noInfo: false
});
devSever.listen(devServerPort, '0.0.0.0', function (err) {
    if (err) {
        console.log(err);
    }
});

console.log('Webpack Dev Server is listening on port ' + devServerPort);

const proxy = httpProxy.createProxyServer({
    secure: false
});

// 捕获异常
proxy.on('error', function (err, req, res) {
    console.log(err);

    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Something went wrong. And we are reporting a custom error message.');
});

const proxyServer = require('http').createServer(function (req, res) {
    // 在这里可以自定义你的路由分发

    if (proxyConfig.isProxy(req.url)) {
        //req.url = proxyConfig.urlTransform(req.url);
        console.log('proxy to: ' + req.url);
        console.log('server:' + proxyConfig.server);
        proxy.web(req, res, { target: proxyConfig.server });
    }
    else {
        proxy.web(req, res, { target: 'http://127.0.0.1:' + devServerPort});
    }
});

proxyServer.listen(proxyConfig.port);
console.log('Proxy server is listening at 127.0.0.1:' + proxyConfig.port);
