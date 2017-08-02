<template>
<div class="layout">
    <div class="layout-content">
        <div class="layout-content-main">
            <h1 class="padding10">音频列表：</h1>
            <Form ref="searchForm" :model="searchForm" inline>
                <Form-item>
                    <Input type="text" v-model="searchForm.audioName" placeholder="音频名称"></Input>
                </Form-item>
                <Form-item>
                    <Button type="primary" @click="handleSearch">搜索</Button>
                </Form-item>
                <Form-item>
                    <Button type="primary" @click="startUpload">导入音频</Button>
                </Form-item>
            </Form>

            <Table stripe custom v-on:on-sort-change="remoteSort" :columns="listcol" :data="listdata"></Table>

            <div class="padding10">
                <Page show-total :total="albumPage" :current="initPageNum" v-on:on-change="pageDown"></Page>
            </div>

            <Modal
                v-model="importAudiosShow"
                width="610"
                title="导入音频">
                <Form :model="importAudiosForm" :label-width="80" ref="importAudiosForm">
                    <Form-item label="上传音频">
                        <Upload ref="upload" multiple :format="['mp3']" :on-format-error="audioFormatError" :show-upload-list="true" :data="audio.query" :before-upload="audioBeforeUpload" :action="audio.action" :on-remove="delFile"
                            :on-error="onAudioError" :on-success="onAudioSuccess">
                            <Button type="ghost" icon="ios-cloud-upload-outline">上传音频</Button>
                        </Upload>
                        <div class="audio-sec-cls" v-show="false">
                            <div v-for="file in audioList">
                                <span class="audio-name-cls">{{file.title}}</span>
                                <audio v-bind:src="file.uri" controls="controls" v-on:loadedmetadata="getDuration" preload></audio>
                                <!-- <span v-on:click="deleteAudio">
                                    <Icon type="ios-trash-outline" :style="{'vertical-align': 'super','cursor':'pointer','margin-left':'20px'}" size="25"></Icon>
                                </span> -->
                            </div>
                        </div>
                        <p>暂只支持mp3格式</p>
                    </Form-item>
                </Form>

                <div slot="footer">
                    <Button v-on:click="closeImportModal">取消</Button>
                    <Button type="primary" @click="handleSubmit">完成</Button>
                </div>
            </Modal>

            <Modal v-model="audioEditShow"
                width="610"
                title="编辑音频">
                <Form :model="editAudiosForm" :label-width="80" ref="editAudiosForm" :rules="editAudiosFormRuleValidate">
                    <Form-item label="音频名称" prop="name">
                        <Input v-model="editAudiosForm.name" placeholder="请输入音频名称"></Input>
                    </Form-item>
                    <Form-item label="备注">
                        <Input v-model="editAudiosForm.remarks" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入备注"></Input>
                    </Form-item>
                </Form>
                <div slot="footer">
                    <Button v-on:click="closeEditModal">取消</Button>
                    <Button type="primary" @click="saveAudio('editAudiosForm')">保存</Button>
                </div>
            </Modal>

        </div>
    </div>
</div>
</template>
<script>
    import Vue from 'vue'
    import uuidV4 from 'uuid/v4'
    import ajax from '../libs/ajax';
    import { getAliyunToken, postFormData } from '../libs/api'
    import {getRawJson,postJson} from '../libs/fetchUtil'
    
    export default {
        data () {

            return {
                albumStatus:false,
                albumPage:10,
                importAudiosShow:false,
                audioEditShow:false,
                currentAudioId:'',
                initPageNum:1,
                searchForm:{
                    audioName:''
                },
                importAudiosForm:{
                    name:''
                },
                editAudiosForm:{
                    name:'',
                    remarks:''
                },
                relateCol:[{
                    title:'音频名称',
                    key:'albumNameRelate'
                }],
                relateData:[],
                listcol: [{
                        title: '音频单曲',
                        key: 'title'
                    },{
                        title: '备注',
                        key: 'remark'
                    },{
                        title: '时长',
                        key: 'duration',
                        width:88,
                        align:"center"
                    },{
                        title:'关联状态',
                        key:'relate_info',
                        align:'center',
                        width:88,
                        render:(h,params)=>{
                            let relate = '',relList = [];
                            if(params.row.relate_info){
                                relate = '已关联'
                                params.row.relate_info.forEach(function(v,k){
                                    relList.push({
                                        albumNameRelate:v.series_name
                                    });
                                });
                                this.relateData = relList;
                                return h('Button',{
                                    props:{
                                        type:'primary',
                                        size:'small'
                                    },
                                    on:{
                                        click:()=>{
                                            this.$Modal.info({
                                                title:'关联状态',
                                                render:(h,params)=>{
                                                    return h('Table',{
                                                        props:{
                                                            columns:this.relateCol,
                                                            data:this.relateData
                                                        }
                                                    });
                                                }
                                            })
                                        }
                                    }
                                },relate)
                            }
                        }
                    },{
                        title:'创建时间',
                        key:'create_time',
                        sortable: true
                    },{
                        title:'修改时间',
                        key:'modify_time',
                        sortable: true
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
                                            this.currentAudioId = params.row.id;
                                            this.audioEditShow = true;
                                            this.editAudiosForm.name = params.row.title;
                                            this.editAudiosForm.remarks = params.row.remark;
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
                                            this.deleteAudio(params.row.id);
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
                audioList:[],
                tempAudioFile:{},
                audioDurationList:[],
                saveBtnStatus:false,
                editAudiosFormRuleValidate:{
                    name:[{ required: true, message: '音频名称不能为空', trigger: 'blur' }]
                }

            };
        },
        created(){
            getAliyunToken('xb-vod').then(res => {
                if(res.resultCode != 0) return;
                this.audio.action = res.data.host;
                this.audio.options = res.data;
            });
            getAliyunToken('xb-3sc').then(res => {
                if(res.resultCode != 0) return;
                this.img.action = res.data.host;
                this.img.options = res.data;
            });

            //album list data
            this.getAudioList(1,null);
        },
        mounted:function(){
            let scope = this;
            let that = this.$refs.upload;
          
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
        },
        computed: {

        },
        methods:{
            remoteSort:function(tdKeys){
                let that=this, order = tdKeys.order=='asc'?'':'-';
                getRawJson('/listen/audio/rear/sort',{name:tdKeys.key,sort:order,page_num:1,rows:10}).then(function(res){
                    if(!res.resultCode){
                        that.listdata = res.data.list;
                        that.albumPage = res.data.count;
                        that.initPageNum = 1;
                    }else{
                        that.$Message.error('获取音频列表数据失败');
                    }
                });
            },
            getTargetKeys () {
                return this.getMockData().filter(() => Math.random() * 2 > 1).map(item => item.key);
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
            getAudioList:function(page_idx,name){
                var that = this,name=name || '';
                getRawJson('/listen/audio/list?page_num='+page_idx+'&rows=10&name='+name).then(function(res){
                    if(!res.resultCode){
                        that.listdata = res.data.list;
                        that.albumPage = res.data.count;
                    }else{
                        that.$Message.error('获取音频列表数据失败');
                    }
                });   
            },
            handleSearch:function(){
                this.getAudioList(1,this.searchForm.albumName);
            },
            startUpload:function(){
                this.importAudiosShow = true;
            },
            pageDown:function(num){
                this.getAudioList(num,null);
            },
            createFilename(file){
                let uuid = uuidV4();
                let name = file.name.split('.');
                let type = name[name.length - 1];
                return uuid + '.' + type;
            },
            audioFormatError:function(file){
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 mp3 格式的音频。'
                });
            },
            audioBeforeUpload:function(file){
               
            },
            onAudioSuccess(response, file, fileList){
                this.audioList.push(this.tempAudioFile[file.uid]);
            },
            onAudioError(error, file, fileList){
                this.$Message.error('音频上传失败！');
            },
            getDuration:function(res){
                this.audioDurationList.push(res.srcElement.duration);
                this.audioList.forEach((v,k)=>{
                    v.duration = this.audioDurationList[k];
                });
            },
            handleSubmit (name) {
                //submit audios
                let that = this;
                if(that.audioList.length){
                    postJson('/listen/audio/add',{audio:that.audioList},false).then(function(res){
                        if(!res.resultCode){
                            that.$Message.success('音频上传成功');
                            that.getAudioList(1,null);
                            that.importAudiosShow = false;
                        }else{
                            that.$Message.error('音频上传失败');
                        }
                    });
                }else{
                    that.$Message.error('请先上传音频');
                }
            },
            closeImportModal:function(){
                this.importAudiosShow = false;
            },
            closeEditModal:function(){
                this.audioEditShow = false;
            },
            saveAudio:function(name){
                let that = this;
                that.saveBtnStatus = true;

                that.$refs[name].validate((valid) => {//校验音频名称
                    if (valid) {
                        postJson('/listen/audio/update',{id:that.currentAudioId,title:that.editAudiosForm.name,remark:that.editAudiosForm.remarks},false).then(function(res){
                            console.log(res);
                            if(!res.resultCode){
                                that.getAudioList(1,null);
                                that.$Message.success('音频修改成功');
                                that.audioEditShow = false;
                            }else{
                                that.$Message.error('音频修改失败!错误原因：'+ res.resultMsg);
                            }
                        });
                    } else {
                        that.submitBtnStatus = false;
                        this.$Message.error('表单验证失败!');
                    }
                })
            },
            deleteAudio:function(audioid){
                let that = this;
                postJson('/listen/audio/delete',{id:audioid},false).then(function(res){
                    if(!res.resultCode){
                        that.$Message.success('音频删除成功');
                        that.getAudioList(1,null);
                    }else{
                        that.$Message.error('音频删除失败');
                    }
                });
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
        }
    }
</script>
<style scope>
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
    .audio-sec-cls{
        max-height: 230px;
        overflow: auto;
    }
    .audio-sec-cls{
        vertical-align: top;
    }
    .audio-name-cls{
        display: inline-block;
        width: 130px;
    }
</style>