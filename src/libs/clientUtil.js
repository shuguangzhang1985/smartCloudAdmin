import {getShareInfo,getWxConfig} from '../api/appAPI';

const Client = checkClient();
const IS_APP = checkApp();
const IS_WEIXIN = is_weixin();
const IS_QQ = is_qq();

/**
 * 请求客户端head参数
 */
export function getHeadParams(){
    const testHead = {
        uid: 1483765,
        pid: '0000',
        ver: '230/51/20160913',
        mid: 5850,
        did: '020000000000',
        sid: 'c4835a3d9f7c4ff29c8891ea688aeffe',
        key: 'a7fb64890111cc7453c860d530f8ac35',
        ime: '866333028578761',
        mgs:'UDnid0000001476093888503wgFutZLk6oRnqYawljpeRNx8zLMAcnPB',
    };
    if(IS_APP){
        let paramsJson = window.kf.getHeadParams();
        let params = JSON.parse(paramsJson);
        
        return params;        
    }else{
        return {};
        //localStorage.headParams = '';
        //return JSON.stringify(testHead);
    }
}

/**
 * 调用客户端分享功能
 */
export function shareByClient(){
    
}
/**
 * 调用客户端评论话题方法/跳转打开(下载)星宝app
 * @param articleId
 * @param callback
 */
export function handleReviewFunc(articleId,callback){

    if(IS_APP){
        window._callback["afterReview"] = callback;
        let data = {
            articleId:articleId,
            callback:'_callback.afterReview'
        };

        window.kf.handleReviewFunc(JSON.stringify(data));
    }else{
        isInstalled()
    }
}
/**
 *  获取链接参数
 */
export function getArgValue(arg){
    let reg = new RegExp("(^|&)"+ arg +"=([^&]*)(&|$)");
    let r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}
/**
 * 调用客户端回复评论方法/跳转打开(下载)星宝app
 * @param data
 * @param callback
 */
export function handleCommentFunc(data, callback){
    if(IS_APP){
        window._callback["afterReview"] = callback;
        const fd = Object.assign(data,{callback:'_callback.afterReview'});
        const jsonData = JSON.stringify(fd);
        window.kf.handleCommentFunc(jsonData);
    }else{
        isInstalled()
    }
}

/**
 * 判断是否为星宝内部打开
 * @returns {boolean}
 */
export function checkApp(){
   return /Xingbook/.test(navigator.userAgent)
}
/**
 * 判断客户端类型
 * @returns {{isAndroid: boolean, isIOS: boolean, isIOS_high_version: boolean}}
 */
function checkClient(){
    const ua = navigator.userAgent;
    return {
        isAndroid : ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1, //android终端
        isIOS: !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),               //ios终端
        isIOS_high_version:!!ua.match(/OS ([8-9]{1}|\d{2,})_.* like Mac OS X/i)
    }
}
//打开或跳转安装APP页面
export function isInstalled(path = '',root = null){
        //let c = getArgValue('c');
        //if(c == 'xbly'){
            if(/android/.test(navigator.userAgent.toLowerCase())) return window.location = 'http://fir.im/tc3u';
            return window.location = 'https://fir.im/cmlkid'
        //}
        //window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.xingbook.park&ckey=CK1359490239118';
    //     }else{
    //         if(root){
    //             return root.$emit('showGuiderEvent')
    //         }
    //     }
    // }else{
        
    //     let dl_link  = '';//获得下载链接

    //     if(/android/.test(ua)){
    //         window.location.href = !!path ? 'xbmg://'+path : 'xbmg://xbmg/0/0?0';
    //     }else{
    //         window.location.href = 'xbmg://' + path;
    //     }

    //     if (Client.isIOS) {
    //         dl_link = 'https://itunes.apple.com/cn/app/id506967733?mt=8';//itms-apps://itunes.apple.com/cn/app/id1030776145?mt=8
    //     } else {
    //         dl_link = 'http://xb-orf.xingbook.com/apk/xingbook-release20170306_xingbao_712.apk';
    //     }
    //     console.log(dl_link);
    //     window.location.href = dl_link;
    //     applink(dl_link)();
    // }

  
}
function applink(fail){
    return function(){
        let clickedAt = +new Date;
        // During tests on 3g/3gs this timeout fires immediately if less than 500ms.
        setTimeout(function(){
            // To avoid failing on return to MobileSafari, ensure freshness!
            !window.document.webkitHidden && setTimeout(function() {
                if (+new Date - clickedAt < 2000) {
                    window.location.href = fail;
                }
            },3000);
        }, 300);
    };
}

export function is_weixin(){
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        return true;
    } else {
        return false;
    }
}

export function is_qq(){
    let ua = navigator.userAgent.toLowerCase();
    if(/android/.test(ua)){
        return /MQQBrowserQQ/.test(ua)
    }else if(/iphone|ipad|ipod/.test(ua)){
        return /QQ/.test(ua) && !/MQQBrowser/.test(ua)
    }else{
        return false
    }
}
/**
 * 分享圈子话题
 * @param data
 * data:
 * url 分享链接
 * title 分享标题
 * description 分享描述
 * pic 分享图
 * resType : 类型 192
 * id : 话题id
 */
export function shareGroup(data){
    if(IS_APP){
        const jsonData = JSON.stringify(data);
        window.kf.shareByClient(jsonData)
    }
}

export function getWexinConfig(){
    return new Promise((success,fail) => {
        let url = encodeURIComponent(location.href.split('#')[0]);
        getShareInfo(url).then(res => {
            const configData = {
                appId: res.appId, // 必填，公众号的唯一标识
                timestamp:parseInt(res.timestamp), // 必填，生成签名的时间戳
                nonceStr:res.nonceStr, // 必填，生成签名的随机串
                signature:res.signature,// 必填，签名，见附录1
                jsApiList:[
                    'onMenuShareAppMessage',
                    'onMenuShareTimeline',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'chooseWXPay'
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            };
            wx.config(configData);
            window._weixinConfigReady = true;
            window._weixinConfigData = configData;

            success();
        });
    })
}
//预售
export function getyushouWexinConfig(){
    return new Promise((success,fail) => {
        let url = encodeURIComponent(location.href.split('#')[0]);
        getWxConfig(url).then(res => {
            const configData = {
                appId: res.appId, // 必填，公众号的唯一标识
                timestamp:parseInt(res.timestamp), // 必填，生成签名的时间戳
                nonceStr:res.nonceStr, // 必填，生成签名的随机串
                signature:res.signature,// 必填，签名，见附录1
                jsApiList:[
                    'onMenuShareAppMessage',
                    'onMenuShareTimeline',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'chooseWXPay'
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            };
            wx.config(configData);
            //wx.hideOptionMenu();
            /*
            wx.hideMenuItems({
                menuList: [
                'menuItem:share:timeline',
                "menuItem:share:appMessage",
                "menuItem:share:qq",
                "menuItem:share:weiboApp",
                'menuItem:share:QZone'
                ] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
            });*/
            window._weixinConfigReady = true;
            window._weixinConfigData = configData;

            success();
        });
    })
}
/**
 * 设置分享信息
 * @param data
 * 包括title,desc,img,link
 */
export function setWeiXinConfig(data){
    wx.ready(function(){
        //分享到朋友圈
        wx.onMenuShareTimeline({
            title:data.title, // 分享标题
            link:data.link, // 分享链接
            imgUrl: data.imgUrl// 分享图标
        });
        //分享给好友
        wx.onMenuShareAppMessage({
            title:data.title, // 分享标题
            desc: data.desc, // 分享描述
            link:data.link, // 分享链接
            imgUrl:data.imgUrl // 分享图标
        });
        wx.onMenuShareQQ({
            title:data.title, // 分享标题
            desc: data.desc, // 分享描述
            link:data.link, // 分享链接
            imgUrl:data.imgUrl // 分享图标
        });
        wx.onMenuShareWeibo({
            title:data.title, // 分享标题
            desc: data.desc, // 分享描述
            link:data.link, // 分享链接
            imgUrl:data.imgUrl // 分享图标
        });
    });
    wx.error(function(res){
        console.log(res);
    });
}

/**
 * 协议链接解析为普通链接
 * @param {string} morelink 协议链接 
 */
export const ExplainedLink = {
    rules:{
        xingbook:{
            detail:'/StoryHouse/interactionDetail.html',
            series:'/StoryHouse/interactionAlbum.html'
        },
        music:{
            series:'/StoryHouse/audioAlbum.html'
        },
        video:{
            series:'/StoryHouse/cartoonAlbum.html'
        },
        parentclass:{
            single:'/ClassRoom/detail.html',
            series:'/ClassRoom/series.html'
        },
        babyclass:{
            single:'/meatballEnglish/detail.html',
            series:'/meatballEnglish/list.html'
        },
        story:{
            series:'/StoryHouse/audioAlbum.html'
        }
    },
    explain:function(morelink){
        if(!morelink) return null;
        const STATIC_APP_HOST = 'static.xingbook.com';

        let OLD_PATH = '/build/crtest',
            origin = location.origin,
            head = 'xbmg://',
            body = '', 
            query = '',
            link = '';

        if(!morelink.match(head)) return morelink;

        link = morelink.replace(head,'');
        let arr = link.split('?');
            body = arr[0];
            query = !!arr[1] ? '?' + arr[1] : '';
        let bodys = body.split('/');
        let body_main = bodys[0];
        let body_sub = !!bodys[1] ? bodys[1] : '';

        if(!this.rules[body_main]) return morelink;

        if(body_sub){
            link = this.rules[body_main][body_sub]
        }else{
            link = this.rules[body_main]
        }

        if(!location.href.match(STATIC_APP_HOST)){
            origin += OLD_PATH;
        }
        
        return origin + link + query;
    }
}
export function explainedLink(morelink) {
    if(!morelink) return null;
    const OLD_APP_HOST = 'xbly.xingbook.com';

    let OLD_PATH = '/build/crtest',
        origin = location.origin,
        head = 'xbmg://',
        body = '', 
        query = '',
        link = '';

    if(!morelink.match(head)) return morelink;

    link = morelink.replace(head,'');
    let arr = link.split('?');
        body = arr[0];
        query = !!arr[1] ? '?' + arr[1] : '';
    let bodys = body.split('/');
    let body_main = bodys[0];
    let body_sub = !!bodys[1] ? bodys[1] : '';

    if(!LinkRules[body_main]) return morelink;

    if(body_sub){
        link = LinkRules[body_main][body_sub]
    }else{
        link = LinkRules[body_main]
    }

    if(location.href.match(OLD_APP_HOST)){
        origin += OLD_PATH;
    }
    
    return origin + link + query;
}
/**
 * 去除字符串空格
 */
function trim(str){
    return str.replace(/(^\s*)|(\s*$)/g, "");  
}