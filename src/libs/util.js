let util = {};
util.title = function(title) {
    title = title ? title + ' - Home' : '星宝馆 智慧云 管理后台';
    window.document.title = title;
};

export default util;