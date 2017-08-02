<template>
<div class="layout">
    <div class="layout-content">
        <div class="layout-content-main">
            <h1 class="padding10">专辑列表</h1>
            <Form ref="searchForm" :model="searchForm" inline>
                <Form-item>
                    <Input type="text" v-model="searchForm.albumName" placeholder="专辑名称"></Input>
                </Form-item>
                <Form-item>
                    <Button type="primary" @click="handleSearch">搜索</Button>
                </Form-item>
                <Form-item>
                    <Button type="primary" @click="createAlbum">创建专辑</Button>
                </Form-item>
            </Form>

            <Table custom v-on:on-sort-change="remoteSort" stripe :columns="listcol" :data="listdata"></Table>

            <div class="padding10">
                <Page show-total :total="albumPage" v-on:on-change="pageDown"></Page>
            </div>

            <Modal
                v-model="newAlbumShow"
                width="710"
                @on-ok="newAlbumOk">
                <p slot="header"><span v-if="newFlag">新建专辑</span><span v-else>编辑专辑</span></p>
                <Form :model="newAlbumForm" ref="newAlbumForm" :label-width="80" :rules="newAlbumRuleValidate">
                    <Form-item label="专辑名称" prop="name">
                        <Input v-model="newAlbumForm.name" placeholder="建议15个字以内"></Input>
                    </Form-item>

                    <Form-item label="专辑封面" prop="img">
                        <Upload :format="['jpg','jpeg','png']" :on-format-error="imgFormatError" :show-upload-list="false" :data="img.query" :action="img.action"
                        :before-upload="imgforeUpload" :on-error="imgUploadEorror" :on-success="imgUploadOK">
                            <Button type="ghost" icon="ios-cloud-upload-outline">上传图片</Button>
                        </Upload>
                        
                        <div v-if="img.viewImg.length" class="demo-upload-list" v-for="(url,idx) in img.viewImg">
                            <img v-bind:src="url" alt="" width="100%">
                            <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView(url)"></Icon>
                            </div>
                        </div>

                        <p>尺寸：250*250；支持jpg,png格式</p>
                    </Form-item>

                    <Form-item label="上传音频" v-show="newFlag">
                        <Upload ref="upload" multiple :format="['mp3']" :on-format-error="audioFormatError" :show-upload-list="true" :data="audio.query" :before-upload="audioBeforeUpload" :action="audio.action" :on-remove="delFile"
                            :on-error="onAudioError" :on-success="onAudioSuccess">
                            <Button type="ghost" icon="ios-cloud-upload-outline">上传音频</Button>
                        </Upload>
                        <div class="audio-sec-cls" v-show="false">
                            <div v-for="file in audioList">
                                <span class="audio-name-cls">{{file.title}}</span>
                                <audio v-bind:src="file.uri" controls="controls" v-on:loadedmetadata="getDuration" preload></audio>
                                <span v-on:click="deleteAudio(file.uid)">
                                    <Icon type="ios-trash-outline" size="25"></Icon>
                                </span>
                            </div>
                        </div>
                        <p><Button type="warning" v-show="saveUploadBtnShow" v-on:click="saveUpload">保存上传</Button></p>
                        <p>暂只支持mp3格式</p>
                    </Form-item>

                    <Form-item label="备注">
                        <Input v-model="newAlbumForm.remarks" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入备注"></Input>
                    </Form-item>

                    <Form-item v-if="newFlag">
                        <Tooltip content="记得点击保存上传哦！否则音频无法导入" placement="bottom-start">
                            <Button type="primary" :disabled="submitBtnStatus" @click="handleSubmit('newAlbumForm')">提交</Button>
                        </Tooltip>
                        
                        <Button type="ghost" @click="handleReset('newAlbumForm')" style="margin-left: 8px">重置</Button>
                    </Form-item>
                    <Form-item v-else>
                        <Button type="primary" :disabled="submitBtnStatus" @click="handleUpdata('newAlbumForm')">编辑提交</Button>
                    </Form-item>

                </Form>
                <div slot="footer"></div>
            </Modal>

            <Modal title="查看图片" v-model="preview">
                <img :src="previewUrl" v-if="preview" style="width: 100%">
            </Modal>
            
            <Modal title="内容配置" width="620" v-model="configSwitch">
                <Transfer
                    id="audio-config-id"
                    ref="transfer"
                    :render-format="renderTransferItem"
                    :data="sourceAudios"
                    :titles="['未选内容','已选内容']"
                    :target-keys="targetAudios"
                    filterable
                    :filter-method="searchFormMultiKeys"
                    :list-style="{'text-align':'left'}"
                    @on-change="transferAudio"></Transfer>
                <div slot="footer">
                    <Button v-on:click="closeConfigModal">取消</Button>
                    <Button type="primary" :diabled="saveConfigBtn" @click="saveConfig">保存</Button>
                </div>
            </Modal>

            <Modal title="导入音频" width="620" v-model="uploadAudioOnly">
                <Form :model="uploadAudioForm" ref="uploadAudioForm" :label-width="80">
                    <Form-item label="上传音频">
                        <Upload ref="upload2" multiple :format="['mp3']" :on-format-error="audioFormatError2" :show-upload-list="true" :data="audio2.query" :before-upload="audioBeforeUpload2" :action="audio2.action" :on-remove="delFile2"
                            :on-error="onAudioError2" :on-success="onAudioSuccess2">
                            <Button type="ghost" icon="ios-cloud-upload-outline">上传音频</Button>
                        </Upload>
                        <div class="audio-sec-cls" v-show="false">
                            <div v-for="file in audioList2">
                                <span class="audio-name-cls">{{file.title}}</span>
                                <audio v-bind:src="file.uri" controls="controls" v-on:loadedmetadata="getDuration2" preload></audio>
                                <!-- <span v-on:click="deleteAudio2">
                                    <Icon type="ios-trash-outline" :style="{'vertical-align':'middle','cursor':'pointer','margin-left':'20px'}" size="25"></Icon>
                                </span> -->
                            </div>
                        </div>
                        <p>暂只支持mp3格式</p>
                    </Form-item>
                    <Form-item>
                        <Button type="primary" @click="completeUpload">完成导入</Button>
                    </Form-item>
                </Form>
                <div slot="footer">
                </div>
            </Modal>
        </div>
        
    </div>
</div>
</template>
<script>
    import Vue from 'vue'
    import Sortable from 'sortablejs'
    import uuidV4 from 'uuid/v4'
    import ajax from '../libs/ajax';
    
    import { getAliyunToken, postFormData } from '../libs/api'
    import {getRawJson,postJson} from '../libs/fetchUtil'
    

    export default {
        data () {
            const validatorPicture = (rule,value,callback)=>{
                setTimeout(()=>{
                    if(!this.img.viewImg.length){
                        callback(new Error('请选择一张导读图片'));
                    }else{
                        callback()
                    }     
                },1500);
            };

            return {
                albumStatus:false,
                albumPage:10,
                newAlbumShow:false,
                configSwitch:false,
                preview:false,
                submitBtnStatus:false,
                saveUploadBtnShow:false,
                saveConfigBtn:false,
                newFlag:true,
                uploadAudioOnly:false,
                resAlbumId:'',
                resAudiosIdList:[],
                savedOrderedIds:[],
                searchForm:{
                    albumName:''
                },
                newAlbumForm:{
                    name:'',
                    img:'',
                    remarks:''
                },
                newAlbumRuleValidate:{
                    name:[{ required: true, message: '名称不能为空', trigger: 'blur' }],
                    img:[{ required: true, validator: validatorPicture, trigger: 'change' }]
                },
                uploadAudioForm:{},
                sourceAudios:[],
                targetAudios:[],
                listcol: [
                    {
                        title: '音频专辑',
                        key: 'name'
                    },{
                        title: '查看内容',
                        key: 'aduio_count',
                        width:200,
                        render:(h,params)=>{
                            return h('div',{
                                        attrs:{
                                            class:'configCls'
                                        }
                                    },[
                                    h('span',{
                                        attrs:{
                                            class:'configNum'
                                        }
                                    },params.row.aduio_count?params.row.aduio_count:'未配置'),
                                    h('Button',{
                                        props:{
                                            type:'primary',
                                            size:'small'
                                        },
                                        on:{
                                            click:()=>{
                                                this.configAudio(params.row.id);
                                                this.currentAlbumId = params.row.id;
                                            }
                                        }
                                    },'配置'),
                                    h('Button',{
                                        props:{
                                            type:'primary',
                                            size:'small'
                                        },
                                        on:{
                                            click:()=>{
                                                this.uploadAudioOnly = true;
                                                this.audioList2.length = 0;
                                                this.currentAlbumId = params.row.id
                                                this.$refs['upload2'].clearFiles();
                                            }
                                        }
                                    },'导入音频')
                                ]);
                        }
                    },{
                        title: '状态',
                        key: 'status',
                        width:120,
                        align:'center',
                        render:(h,params)=>{
                            return h('i-switch',{
                                props:{
                                    size:'large',
                                    value:(params.row.status=='on') ? true : false
                                },
                                on:{
                                    input:(status)=>{
                                        this.changeStatus(params.row.id,status?'on':'off');
                                    }
                                }
                            },[
                                h('span',{
                                    slot:'open'
                                },'上架'),
                                h('span',{
                                    slot:'close'
                                },'下架')
                            ])
                        }
                    },{
                        title:'创建时间',
                        key:'create_time',
                        align:'center',
                        sortable:true
                    },{
                        title:'修改时间',
                        key:'modify_time',
                        align:'center',
                        sortable:true
                    },{
                        title:'操作',
                        key:'operate',
                        width:140,
                        render:(h,params)=>{
                            return h('div',{
                                attrs:{
                                    class:'configCls'
                                }
                            },[
                                h('Button',{
                                    props:{
                                        type:'primary',
                                        size:'small'
                                    },
                                    on:{
                                        click:()=>{
                                            this.currentAlbumId = params.row.id
                                            this.newAlbumShow = true;
                                            this.newFlag = false;
                                            this.newAlbumForm.name = params.row.name;
                                            this.img.viewImg.length = 0;
                                            this.img.viewImg.push(params.row.cover);
                                            this.newAlbumForm.remarks = params.row.brief;
                                        }
                                    }
                                },'编辑'),
                                h('Button',{
                                    props:{
                                        type:'primary',
                                        size:'small',
                                        type:'error'
                                    },
                                    on:{
                                        click:()=>{
                                            this.deleteAlbum(params.row.id);
                                        }
                                    }
                                },'删除')
                            ]);
                        }
                    }],
                listdata:[],
                img:{
                    cover:{
                        status:'',
                        url:'',
                        name:'',
                        filename:''
                    },
                    options:null,
                    query:{},
                    action:'http://xb-3sc.oss-cn-hangzhou.aliyuncs.com',
                    viewHost:'http://xb-3sc.xingbook.com/xb-3sc/',
                    viewImg:[],
                    visible:false,
                    currentFileName:''
                },
                audio:{
                    query:{},
                    format:['mp3'],
                    action:'http://xb-vod.oss-cn-hangzhou.aliyuncs.com',
                    options:null,
                    file:{
                        filename:'',
                        size:0,
                        name:'',
                        duration:0
                    },
                    audioFlag:false,
                    viewHost:'http://xb-vod.oss-cn-hangzhou.aliyuncs.com/audio/'
                },
                audio2:{
                    query:{},
                    format:['mp3'],
                    action:'http://xb-vod.oss-cn-hangzhou.aliyuncs.com',
                    options:null,
                    file:{
                        filename:'',
                        size:0,
                        name:'',
                        duration:0
                    },
                    audioFlag:false,
                    viewHost:'http://xb-vod.oss-cn-hangzhou.aliyuncs.com/audio/'
                },
                audioList:[],
                tempAudioFile:{},
                audioDurationList:[],
                audioList2:[],
                tempAudioFile2:{},
                audioDurationList2:[],
                series_id:'',
                res_ids:[],
                currentAlbumId:'',
                oldIds:[],
                newIds:[]
            };
        },
        created(){
            getAliyunToken('xb-vod').then(res => {
                if(res.resultCode != 0) return;
                this.audio.action = res.data.host;
                this.audio.options = res.data;

                this.audio2.action = res.data.host;
                this.audio2.options = res.data;
            });

            getAliyunToken('xb-3sc').then(res => {
                if(res.resultCode != 0) return;
                this.img.action = res.data.host;
                this.img.options = res.data;
            });

            //album list data
            this.getAlbumList(1,null);
        },
        watch:{
            audioList:function(){
                console.log(this.audioList);
                if(this.audioList.length>0){
                    this.saveUploadBtnShow = true;
                }else{
                    this.saveUploadBtnShow = false;
                }
            }
        },
        mounted:function(){
            let scope = this;
            let that = this.$refs.upload;
            let that2 = this.$refs.upload2;
           // this.$refs.transfer.renderF
          that.post = function (file) {
                // check format
                if (that.format.length) {
                    const _file_format = file.name.split('.').pop().toLocaleLowerCase();
                    const checked = that.format.some(item => item.toLocaleLowerCase() === _file_format);
                    if (!checked) {
                        that.onFormatError(file, that.fileList);
                        return false;
                    }
                }
                // check maxSize
                if (that.maxSize) {
                    if (file.size > that.maxSize * 1024) {
                        that.onExceededSize(file, that.fileList);
                        return false;
                    }
                }
                that.handleStart(file);
                let formData = new FormData();
                formData.append(that.name, file);

                ajax({
                    headers: that.headers,
                    withCredentials: that.withCredentials,
                    file: file,
                    data: scope.getAliOSSData(file),
                    filename: that.name,
                    action: that.action,
                    onProgress: e => {
                        that.handleProgress(e, file);
                    },
                    onSuccess: res => {
                        that.handleSuccess(res, file);
                    },
                    onError: (err, response) => {
                        that.handleError(err, response, file);
                    }
                });
            }


          that2.post = function (file) {
                // check format
                if (that2.format.length) {
                    const _file_format = file.name.split('.').pop().toLocaleLowerCase();
                    const checked = that2.format.some(item => item.toLocaleLowerCase() === _file_format);
                    if (!checked) {
                        that2.onFormatError(file, that2.fileList);
                        return false;
                    }
                }

                // check maxSize
                if (that2.maxSize) {
                    if (file.size > that2.maxSize * 1024) {
                        that2.onExceededSize(file, that2.fileList);
                        return false;
                    }
                }
                
                that2.handleStart(file);
                let formData = new FormData();
                formData.append(that2.name, file);

                ajax({
                    headers: that2.headers,
                    withCredentials: that2.withCredentials,
                    file: file,
                    data: scope.getAliOSSData(file),
                    filename: that2.name,
                    action: that2.action,
                    onProgress: e => {
                        that2.handleProgress(e, file);
                    },
                    onSuccess: res => {
                        that2.handleSuccess(res, file);
                    },
                    onError: (err, response) => {
                        that2.handleError(err, response, file);
                    }
                });
            }
        },
        computed: {

        },
        watch:{

        },
        methods:{
            renderTransferItem(item)  {
                return '<span class="target-audio-cls" data-id="'+item.key+'">'+item.label+'</span>';
            },
            getAudioListData (id) {
                let that = this;
                that.targetAudios.length=0;
                that.sourceAudios.length=0
                getRawJson('/listen/series/set/list',{series_id:id}).then(function(res){
                    if(!res.resultCode){
                        res.data.already_set_result.list.forEach(function(v,k){
                            that.targetAudios.push(v.id);
                        });

                        res.data.all_set_result.list.forEach(function(v,k){
                            that.sourceAudios.push({
                                "key":v.id,
                                "label":v.title
                            });
                        });
                      
                        var el = document.querySelectorAll('#audio-config-id .ivu-transfer-list-content')[1];
                        var sortable = Sortable.create(el,{
                            filter: ".ivu-transfer-list-content-not-found",
                            onEnd:function(evt){
                            }
                        });

                    }else{
                        that.$Message.error('获取音频数据失败');
                    }
                });
            },
            remoteSort:function(tdKeys){
                console.log(tdKeys);
                let that=this, order = tdKeys.order=='asc'?'':'-';
                getRawJson('/listen/series/rear/sort',{name:tdKeys.key,sort:order,page_num:1,rows:10}).then(function(res){
                    if(!res.resultCode){
                        that.listdata = res.data.list;
                        that.albumPage = res.data.count;
                    }else{
                        that.$Message.error('获取专辑列表数据失败');
                    }
                });
            },
            getTargetKeys () {
                return this.getMockData().filter(() => Math.random() * 2 > 1).map(item => item.key);
            },
            emptyAll(){
                this.newAlbumForm.name = '';
                this.img.viewImg.length = 0;
                this.audioList.length = 0;
                this.audioList2.length = 0;
                this.newAlbumForm.remarks = '';
                this.saveUploadBtnShow = false;
            },
            getAliOSSData:function(file){
                let uuid = uuidV4(),
                    name = file.name.split('.'),
                    type = name[name.length - 1],
                    filename = uuid + '.' + type,
                    tempAudio = {
                        uri:this.audio.viewHost + filename,
                        title:name[0],
                        duration:0,
                        uid:file.uid
                    };

                this.tempAudioFile[file.uid] = tempAudio;

                return {
                    "OSSAccessKeyId":this.audio.options.accessid,
                    "policy":this.audio.options.policy,
                    "Signature":this.audio.options.signature,
                    "success_action_status":'200',
                    "key": this.audio.options.dir + filename
                }
            },
            getAlbumList:function(page_idx,name){
                var that = this,name=name || '';
                getRawJson('/listen/series/list?page_num='+page_idx+'&rows=10&name='+name).then(function(res){
                    if(!res.resultCode){
                        that.listdata = res.data.list;
                        that.albumPage = res.data.count;
                    }
                });   
            },
            handleSearch:function(){
                this.getAlbumList(1,this.searchForm.albumName);
            },
            createAlbum:function(){
                this.emptyAll();
                this.$refs['newAlbumForm'].resetFields();
                this.newAlbumShow = true;
                this.newFlag = true;

                //清空音频列表记录
                this.$refs['upload'].clearFiles();
            },
            pageDown:function(num){
                this.getAlbumList(num,null);
            },
            changeStatus:function(id,status){
                let that = this;
                postJson('/listen/series/open',{id:id,status:status},false).then(function(res){
                    if(!res.resultCode){
                        that.$Message.success('操作成功！');
                    }else{
                        that.$Message.error('操作失败！');
                    }
                });
            },
            newAlbumOk:function(){

            },
            createFilename(file){
                let uuid = uuidV4();
                let name = file.name.split('.');
                let type = name[name.length - 1];
                return uuid + '.' + type;
            },
            imgFormatError:function(file){
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
                });
            },
            imgforeUpload:function(file){
                if(typeof this.img.options != 'object'){
                    this.$Message.error('配置信息还未生成，请稍后!');
                    return false;
                }
                let filename = this.createFilename(file);
                this.img.currentFileName = filename;

                this.img.query = {
                    "OSSAccessKeyId":this.img.options.accessid,
                    "policy":this.img.options.policy,
                    "Signature":this.img.options.signature,
                    "success_action_status":'200',
                    "key":this.img.options.dir + filename
                }
                return new Promise( (resolve,reject) => {
                    setTimeout(() => {
                        resolve()
                    },100)
                })
            },
            imgUploadEorror:function(error){
                this.$Message.info('图片上传失败 请重试');
            },
            imgUploadOK:function(response, file, fileList){//图片只能上传一张
                this.img.viewImg = [];
                this.img.viewImg.push(this.img.viewHost + this.img.currentFileName);
            },
            handleView (url) {
                this.previewUrl = url;
                this.preview = true;
            },
            audioFormatError:function(file){
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 mp3 格式的音频。'
                });
            },
            audioFormatError2:function(file){
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 mp3 格式的音频。'
                });
            },
            audioBeforeUpload:function(file){
            },
            audioBeforeUpload2:function(file){
            },
            onAudioSuccess(response, file, fileList){
                this.audioList.push(this.tempAudioFile[file.uid]);
                if(this.audioList.length>0){
                    this.saveUploadBtnShow = true;
                }
            },
            onAudioSuccess2(response, file, fileList){
                this.audioList2.push(this.tempAudioFile[file.uid]);
            },
            onAudioError(error, file, fileList){
                this.$Message.error('音频上传失败！');
            },
            onAudioError2(error, file, fileList){
                this.$Message.error('音频上传失败！');
            },
            deleteAudio(uid){//根据uid删除音频
                this.audioList.forEach((f,i)=>{
                    if(uid == f.uid){
                        this.audioList.splice(i,1);
                    }
                });
                if(this.audioList.length==0){
                    this.saveUploadBtnShow = false;
                }
            },
            delFile(file,fileList){
                this.audioList.forEach((f,i)=>{
                    if(file.uid == f.uid){
                        this.audioList.splice(i,1);
                    }
                });
                if(this.audioList.length==0){
                    this.saveUploadBtnShow = false;
                }
            },
            delFile2(file,fileList){
                this.audioList2.forEach((f,i)=>{
                    if(file.uid == f.uid){
                        this.audioList2.splice(i,1);
                    }
                });
            },
            getDuration:function(res){
                this.audioDurationList.push(res.srcElement.duration);
                this.audioList.forEach((v,k)=>{
                    v.duration = this.audioDurationList[k];
                });
            },
            getDuration2:function(res){
                this.audioDurationList2.push(res.srcElement.duration);
                this.audioList2.forEach((v,k)=>{
                    v.duration = this.audioDurationList2[k];
                });
                console.log(this.audioList2);
            },
            handleSubmit (name) {
                let that = this;
                that.submitBtnStatus = true;

                that.$refs[name].validate((valid) => {//校验专辑名称 封面图片
                    if (valid) {
                        //检测是否上传了音频         
                        postJson('/listen/series/add',{
                            name:that.newAlbumForm.name,
                            cover:that.img.viewImg[0],
                            brief:that.newAlbumForm.remarks,
                            series_id:that.series_id?that.series_id:'',
                            res_ids:that.res_ids?that.res_ids:[]
                        },false).then(function(res){
                            if(!res.resultCode){
                                that.$Message.success('专辑新建成功');
                                that.newAlbumShow = false;
                                that.getAlbumList(1,null);
                            }else{
                                that.$Message.error('表单验证失败!错误原因：'+ res.resultMsg);
                            }
                        });
                    } else {
                        that.submitBtnStatus = false;
                        that.$Message.error('表单验证失败!');
                    }
                })
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            },
            configAudio:function(id){
                this.configSwitch = true;
                this.getAudioListData(id);
            },
            deleteAlbum:function(id){
                let that = this;
                postJson('/listen/series/delete',{id:id},false).then(function(res){
                    if(!res.resultCode){
                        that.$Message.success('删除成功!');
                        that.getAlbumList(1,null);
                    }else{
                        that.$Message.error('删除失败!请重试');
                    }
                });
            },
            transferAudio:function(newTargetKeys,direction, moveKeys){
                console.log(newTargetKeys)
                this.targetAudios = newTargetKeys;
            },
            filterAlbum:function(data,query){
                return data.label.indexOf(query) > -1;
            },
            saveUpload:function(){
                if(this.audioList.length){
                    let that = this;
                    postJson('/listen/series/upload/audio',{audio:this.audioList},false).then(function(res){
                        if(!res.resultCode){
                            that.series_id = res.data.series_id;
                            that.res_ids = res.data.res_ids;
                            that.$Message.success('音频保存成功');
                        }
                    });
                }else{
                    this.$Message.warning('请先上传音频');
                }
            },
            completeUpload:function(){
                if(this.audioList2.length){
                    let that = this;
                    postJson('/listen/series/upload',{audio:this.audioList2,series_id:this.currentAlbumId},false).then(function(res){
                        if(!res.resultCode){
                            that.getAlbumList(1,null);
                            that.$Message.success('音频上传成功');
                            that.uploadAudioOnly = false;
                        }else{
                            that.$Message.error('音频上传失败'+res.resultMsg);
                        }
                    });
                }else{
                    this.$Message.warning('请先上传音频');
                }
            },
            handleUpdata:function(){
                let that = this;
                that.submitBtnStatus = true;
                that.$refs['newAlbumForm'].validate((valid)=>{
                    if(valid){
                        postJson('/listen/series/update',{
                            id  :that.currentAlbumId,
                            name:that.newAlbumForm.name,
                            cover:that.img.viewImg[0],
                            brief:that.newAlbumForm.remarks
                        },false).then(function(res){
                            if(!res.resultCode){
                                that.getAlbumList(1,null);
                                that.$Message.success('修改成功');
                                that.newAlbumShow = false;
                            }else{
                                that.$Message.error('修改失败，原因'+res.resultMsg);
                            }
                        });
                    }else{
                        that.submitBtnStatus = false;
                        that.$Message.error('表单验证失败!');
                    }
                });
            },
            closeConfigModal:function(){
                this.configSwitch = false;
            },
            saveConfig:function(){
                let that = this,tempSourceKeys=[];
                that.saveConfigBtn = false;
                that.sourceAudios.forEach(function(v,k){
                    tempSourceKeys.push(v.key);
                });
                //get ordered audio ids
                let context = document.querySelectorAll('#audio-config-id .ivu-transfer-list-content')[1],
                    linode  = context.querySelectorAll('.target-audio-cls'),
                    orderedIds = [];
                linode.forEach((node,index)=>{
                    orderedIds.push(node.getAttribute('data-id'));
                });
                let remainIds = tempSourceKeys.filter(key=>!that.targetAudios.includes(key));
                postJson('/listen/series/set/go',{
                    series_id:that.currentAlbumId,
                    already_set:orderedIds,
                    can_set:remainIds
                },false).then(function(res){
                    if(!res.resultCode){
                        that.getAlbumList(1,null);
                        that.configSwitch = false;
                        that.$Message.success('配置成功');
                    }else{
                        that.$Message.error('配置失败,原因'+res.resultMsg);
                    }
                });   
            },
            searchFormMultiKeys:function(data,query){
                if(query){
                    let flag=false, words_list = query.trim().split(/\s+/g);
                    words_list.forEach((v,idx)=>{
                        if(data.label.indexOf(v) > -1){
                            flag = true;
                        }
                    });
                    if(flag){
                        return true;
                    }
                }else{
                    return data.label.indexOf(query) > -1;
                }
            }
        }
    }
</script>
<style>
    .layout{
        border: 1px solid #d7dde4;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
    }
    .layout-breadcrumb{
        padding: 10px 15px 0;
    }
    .layout-content{
        min-height: 200px;
        margin: 15px;
        overflow: hidden;
        background: #fff;
        border-radius: 4px;
    }
    .layout-content-main{
        padding: 10px;
    }
    .layout-copy{
        text-align: center;
        padding: 10px 0 20px;
        color: #9ea7b4;
    }
    .layout-menu-left{
        background: #464c5b;
    }
    .layout-header{
        height: 60px;
        background: #fff;
        box-shadow: 0 1px 1px rgba(0,0,0,.1);
    }
    .layout-logo-left{
        width: 90%;
        height: 30px;
        background: #5b6270;
        border-radius: 3px;
        margin: 15px auto;
    }
    .layout-ceiling-main a{
        color: #9ba7b5;
    }
    .layout-hide-text .layout-text{
        display: none;
    }
    .ivu-col{
        transition: width .2s ease-in-out;
    }
    .padding10{
        padding: 10px 0;
    }
    .img-list-cls{
        display: inline-block;
        width: 60px;
        height: 60px;
        overflow: hidden;
        border: 1px solid transparent;
        border-radius: 4px;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-right: 6px;
    }
    form{
        padding-right: 20px;
    }
    .demo-upload-list{
        display: inline-block;
        width: 60px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-right: 4px;
        margin-top: 15px;
    }
    .demo-upload-list img{
        width: 100%;
        height: 100%;
    }
    .demo-upload-list-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
    }
    .demo-upload-list:hover .demo-upload-list-cover{
        display: block;
    }
    .demo-upload-list-cover i{
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 0 2px;
    }
    .margin-top20-cls{
        margin-top: 20px;
    }
    .modalWrapper{
        text-align: center;
        padding-top: 50px;
    }

    .layout{
        padding-bottom: 120px;
    }
    .configCls button{
        margin-left:10px;
    }
    .audio-sec-cls{
        max-height: 230px;
        overflow: auto;
        margin-top: 5px;
    }
    .audio-sec-cls > div{
        margin: 5px 0;
    }
    .audio-sec-cls audio{
        vertical-align: bottom;
    }
    .ivu-transfer .ivu-transfer-list{
        height: 400px;
    }
    .ivu-transfer{
        text-align: center;
    }
    .order-button{text-align: right;margin-right: 85px;margin-bottom: 10px;}
    .configNum{
        display: inline-block;
        width: 40px;
    }
    .audio-name-cls{
        display: inline-block;
        width: 130px;
    }
    .ivu-icon-ios-trash-outline{
        vertical-align:middle;
        cursor:pointer;
        margin-left:15px;
    }
</style>