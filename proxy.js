/**
 * Created by konie on 16-8-16.
 */
'use strict';
const SERVER_HOST = {
    product:'http://www.xingbook.com:9005/',//生产环境
    public:'http://xbaotest.miguxue.com/', //线上测试环境
    inner:'http://120.26.4.86:4396/',  //86测试环境
    test:'http://120.26.4.202:9003',
    local:'http://192.168.1.139:8000',
    testserver:'http://120.26.4.86:4396',
    remoteip:'http://192.168.1.105:8000'
};
const proxyServer = SERVER_HOST.testserver;

const proxyUrlPrefix = "/cms";
const proxyPort = 3333;

/**
 * 是否需要代理
 * @param url 原url
 * @returns {boolean} 返回true表示需要代理
 */
exports.isProxy = function (url) {
    if (url.indexOf(proxyUrlPrefix) === 0) {
        return true;
    } else {
        return false;
    }
};

/**
 * 代理url转换方法
 * @param url 原ul
 * @returns {string} 重定向到服务器的url
 */
// exports.urlTransform = function (url) {
//     return url.substring(proxyUrlPrefix.length, url.length);
// };

exports.port = proxyPort;
exports.server = proxyServer;
