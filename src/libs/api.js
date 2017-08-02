import { getJson, getJsonWithFilter, postJson } from './fetch-util'






/**
 * 登录
 * @param {*} username 
 * @param {*} password 
 */
export function postLogin(username,password){
    return postJson('/login',{username,password})
}
/**
 * 退出登录
 */
export function postLogout(){
    return postJson('/logout')
}
/**
 * 校验是否登录
 */
export function checkLogin(){
    return getJson('/index')
}
/**
 * 主题列表
 */
export function getThemeList(pageNum,row){
    return getJson('/theme/list',{page_num:pageNum,rows:row})
}
/**
 * 阿里云获取token
 */
export function getAliyunToken(bucket){
    return getJson('/aliyun/token',{bucket})
}

/**
 * 新增主题
 */
export function postFormData(formdata){
    return postJson('/theme/add',formdata)
}

/**
 * 主题详情
 */
export function getInfo(id){
    return getJson('/theme/info',{id:id})
}
/**
 * 修改主题
 */
export function modifyFormData(formdata){
    return postJson('/theme/update',formdata)
}


/**
 * 删除主题
 */
export function removeTheme(id){
    return postJson('/theme/remove',{id:id})
}

/**
 * 撤销删除主题
 */
export function undoRemoveTheme(id){
    return postJson('/theme/undo/remove',{id:id})
}

/**
 * 下架主题
 */
export function downTheme(id){
    return postJson('/theme/down',{id:id})
}

/**
 * 上架主题
 */
export function upTheme(id){
    return postJson('/theme/up',{id:id})
}

/**
 * 关联子主题列表页面
 */
export function getChileThemelist(id){
    return getJson('/theme/set/list',{id:id})
}

/**
 * 关联子主题提交
 */
export function modifyChileThemelist(id,resIds){
    return postJson('/theme/set/go',{id:id,res_id:resIds})
}


/**
 * 模块配置列表获取
 */
export function getModalList(pageNum,row){
    return getJson('/listen/model/list',{page_num:pageNum,rows:row})
}

/**
 * 模块配置列表获取
 */
export function addModalConfig(formdata){
    return postJson('/listen/model/add',formdata)
}

/**
 * 智能模块配置列表获取
 */
export function getModalConfigList(){
    return getJson('/listen/interval/list')
}


/**
 * 模块配置状态改变
 */
export function changeStatusOpen(id,status){
    return postJson('/listen/model/open',{tag_id:id,abandon_flag:status})
}

/**
 * 模块配置修改
 */
export function editModal(id,name,num){
    return postJson('/listen/model/update',{tag_id:id,name:name,seq_no:num})
}

/**
 * 模块配置删除
 */
export function deleteModal(id){
    return postJson('/listen/model/delete',{tag_id:id})
}

/**
 * 模块配置列表排序
 */
export function modalListSort(name,sort,pageNum,row){
    return getJson('/listen/model/rear/sort',{name:name,sort:sort,page_num:pageNum,rows:row})
}

/**
 * 模块配置选择排序
 */
export function selectModal(value){
    return postJson('/listen/model/sort/'+value)
}

/**
 * 模块配置前端排序
 */
export function selectStatus(value){
    return postJson('/listen/model/front/sort',{sort:value})
}



/**
 * 模块配置穿梭框数据获取
 */
export function getTransferList1(id){
    return getJson('/listen/model/set/list',{tag_id:id})
}

/**
 * 模块配置穿梭框数据修改
 */
export function modifyTransferList1(id,ids){
    return postJson('/listen/model/set/go',{tag_id:id,series_ids:ids})
}

/**
 * 智能模块配置穿梭框数据获取
 */
export function getTransferList(id){
    return getJson('/listen/interval/set/list',{id:id})
}

/**
 * 智能模块配置穿梭框数据修改
 */
export function modifyTransferList(id,ids){
    return postJson('/listen/interval/set/go',{id:id,series_ids:ids})
}