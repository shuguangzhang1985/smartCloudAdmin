<template>
<div class="layout">
    <div class="layout-content">
        <div class="layout-content-main">
            <Button type="primary" v-on:click="showModal">新建</Button>
            <Button v-on:click="modifyMe">修改</Button>
            <Button type="error" v-on:click="deleteMe">删除</Button>
        </div>
        <Alert v-if="showUndo" type="success" show-icon closable>
            删除 {{formItem.subThemeName}} 成功！
            <span slot="desc">点击撤销删除按钮可恢复最近一次删除操作</span>
            <Button type="success" v-on:click="undoDelete">撤销删除</Button>
        </Alert>
        <Table border stripe highlight-row :columns="childListColumn" :data="childList" v-on:on-row-click="selectHandler"></Table>
        <div class="padding10"><Page :total="totalchildtheme" v-on:on-change="subThemeListPage" v-on:on-page-size-change="subThemeListPageCountChanged" show-total show-sizer show-elevator></Page></div>
        <Modal
            v-model="modalswitch"
            title="配置子主题内容"
            width="880"
            :styles="{top: '20px','margin-bottom':'60px'}"
            @on-ok="addNewTheme"
            @on-cancel="cancelNewTheme">

            <Form ref="formValidate" :model="formItem" :style="{'padding-right':'10px'}" :rules="ruleValidate" :label-width="100">
                <Form-item label="子主题名称" prop="subThemeName">
                    <Input v-model="formItem.subThemeName" placeholder="建议20字以内"></Input>
                </Form-item>

                <Form-item label="简介" prop="subThemeDesc">
                    <!-- <Input v-model="formItem.subThemeDesc" type="textarea" :autosize="{minRows: 4,maxRows: 5}" placeholder="其他联系方式等备注说明"></Input> -->
                    <div id="editorDesc">
                      <textarea :value="formItem.subThemeDesc" @input="updateMarkDataDesc" id="markedAreaDesc" placeholder="其他联系方式等备注说明" v-on:blur="checkWords"></textarea>
                      <div id="markedResultDesc" ref="markedResultDesc" v-html="compiledMarkdownDesc"></div>
                    </div>
                </Form-item>

                <Form-item label="导读图片">
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
                    
                    <p></p>
                    <p>尺寸：250*250；作为音频展示、分享图标，支持jpg,png格式</p>
                </Form-item>

                <Form-item label="导读音频" prop="audio">
                    <Upload v-if="!audio.audioFlag" :format="['mp3']" :on-format-error="audioFormatError" :show-upload-list="false" :data="audio.query" :before-upload="audioBeforeUpload" :action="audio.action"
                        :on-error="onAudioError" :on-success="onAudioSuccess">
                        <Button type="ghost" icon="ios-cloud-upload-outline">上传音频</Button>
                    </Upload>
                    <div>
                        <p v-if="audio.audioFlag">{{audio.file.name}}</p>
                        <audio v-if="audio.audioFlag" v-bind:src="audio.viewHost+audio.file.filename" controls="controls" v-on:loadedmetadata="getDuration" preload></audio>
                        <span v-if="audio.audioFlag" v-on:click="deleteAudio">
                            <Icon type="ios-trash-outline" :style="{'vertical-align': 'super','cursor':'pointer','margin-left':'20px'}" size="25"></Icon>
                        </span>
                    </div>
                    <p>暂只支持mp3格式</p>
                </Form-item>

                <Form-item label="导读文章" prop="subThemeArticle">
                    <!-- <Input v-model="formItem.subThemeArticle" type="textarea" :autosize="{minRows: 4,maxRows: 5}" placeholder="建议1000字以内"></Input> -->
                    <!-- <div id="editor">
                      <textarea :value="formItem.subThemeArticle" @input="updateMarkData" id="markedArea" placeholder="建议1000字以内" v-on:blur="checkWords"></textarea>
                      <div id="markedResult" ref="markedResult" v-html="compiledMarkdown"></div>
                    </div> -->

                    <mavon-editor v-model="formItem.subThemeArticle" :subfield="false" v-on:change="checkMkDown" />
                </Form-item>
                
                <Form-item label="背景图片">
                    <Upload :format="['jpg','jpeg','png']" :on-format-error="bgimgFormatError" :show-upload-list="false" :data="bgimg.query" :before-upload="bgimgBeforeUpload" :action="bgimg.action"
                    :on-error="bgimgUploadError" :on-success="onBgimgSuccess"
                    >
                        <Button type="ghost" icon="ios-cloud-upload-outline">上传背景图片</Button>
                    </Upload>
                    <div v-if="bgimg.viewImg.length" class="demo-upload-list" v-for="(url,idx) in bgimg.viewImg">
                        <img v-bind:src="url" alt="" width="100%">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="handleView(url)"></Icon>
                        </div>
                    </div>
                    <p>尺寸：750*200，支持jpg</p>
                </Form-item>

                <Form-item label="教学视频" prop="video">
                    <Upload v-if="!video.videoFlag" :format="['mp4']" :max-size="512000" :data="video.query" :before-upload="videoBeforeUpload" :action="video.action" :on-format-error="videoFormatError" :on-exceeded-size="handleVideoMaxSize" :on-error="videoUploadError" :on-success="videoUploadOk">
                        <Button type="ghost" icon="ios-cloud-upload-outline">上传视频</Button>
                    </Upload>
                    <div>
                        <video v-if="video.videoFlag" v-bind:src="video.viewHost+video.file.filename" width="200" controls="controls" v-on:loadedmetadata="getVideoDuration" preload></video>
                        <span v-if="video.videoFlag" v-on:click="deleteVideo">
                            <Icon type="ios-trash-outline" :style="{'vertical-align': 'super','cursor':'pointer','margin-left':'20px'}" size="25"></Icon>
                        </span>
                    </div>
                </Form-item>

                <Form-item label="视频封面图片" prop="videoCover">
                    <Upload :format="['jpg','jpeg','png']" :on-format-error="videoCoverFormatError" :show-upload-list="false" :data="videoCover.query" :before-upload="videoCoverBeforeUpload" :action="videoCover.action" :on-error="videoCoverUploadError" :on-success="onvideoCoverSuccess">
                        <Button type="ghost" icon="ios-cloud-upload-outline">上传视频封面图片</Button>
                    </Upload>
                    <div class="demo-upload-list" v-for="(url,idx) in videoCover.viewImg">
                        <img v-bind:src="url" v-on:load="videoCoverLoadOk()" alt="" width="100%">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="handleView(url)"></Icon>
                        </div>
                    </div>
                </Form-item>

                <Form-item label="配套绘本" prop="book">
                    <Button type="ghost" v-on:click="configBook">配置</Button>
                    <div v-if="relatedBook.showFlag">
                        <p>绘本名称：{{relatedBook.title}}</p>
                        <p>绘本orid：{{relatedBook.orid}}</p>
                    </div>
                </Form-item>
            
                <Form-item label="绘本封面图片" prop="bookCover">
                    <Upload :format="['jpg','jpeg','png']" :on-format-error="bookCoverFormatError" :show-upload-list="false" :data="bookCover.query" :before-upload="bookCoverBeforeUpload" :action="bookCover.action"
                    :on-error="bookCoverUploadError" :on-success="onbookCoverSuccess">
                        <Button type="ghost" icon="ios-cloud-upload-outline">上传绘本封面图片</Button>
                    </Upload>
                    <p>尺寸：678*396，支持jpg,png</p>
                    <div v-if="bookCover.viewImg.length" class="demo-upload-list" v-for="(url,idx) in bookCover.viewImg">
                        <img v-bind:src="url" alt="" width="100%">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="handleView(url)"></Icon>
                        </div>
                    </div>
                </Form-item>

                <Form-item>
                    <div class="margin-top20-cls">
                        <Button v-if="isNew" :disabled="buttonDisabled" type="primary" @click="handleSubmit('formValidate')">新建提交</Button>
                        <Button v-else :disabled="buttonDisabled" type="primary" @click="handleModifySubmit('formValidate')">修改提交</Button>
                    </div>
                </Form-item>
            </Form>
    
            <div slot="footer"></div>
        </Modal>

        <Modal title="查看图片" v-model="preview">
            <img :src="previewUrl" v-if="preview" style="width: 100%">
        </Modal>

        <Modal
            v-model="modalbook"
            title="配置绘本"
            width="800"
            @on-ok="bookok"
            @on-cancel="bookcancel">
                <Form ref="formInline" :model="formInlineBook" :label-width="80" inline>
                    <Form-item label="ORID" prop="orid">
                        <Input type="text" v-model="formInlineBook.orid" placeholder="根据orid查询"></Input>
                    </Form-item>
                    <Form-item label="绘本名称" prop="bookName">
                        <Input type="text" v-model="formInlineBook.bookName" placeholder="根据名称查询"></Input>
                    </Form-item>
                    <Form-item>
                        <Button @click="searchBook">搜索</Button>
                    </Form-item>
                    <Table highlight-row :columns="bookListColumn" :data="bookList" v-on:on-row-click="selectCurrentBookRow"></Table>
                    <div class="padding10">
                        <Page v-if="modalbook" :current="bookCurrentPage" :total="bookTotal" v-on:on-change="bookPage"></Page>
                    </div>
                </Form>
        </Modal>
    </div>
</div>
</template>
<script>
    import Vue from 'vue'
    import uuidV4 from 'uuid/v4'
    import { getAliyunToken, postFormData } from '../libs/api'
    import {getRawJson,postJson} from '../libs/fetchUtil'
    import mavonEditor from 'mavon-editor'
    import 'mavon-editor/dist/css/index.css'
    
    Vue.use(mavonEditor)

    export default {
        data () {
            const validatorPicture = (rule,value,callback)=>{//存在的问题 上传文件成功的回调执行迟于校验函数 所以此函数总是检测不到有文件上传 目前使用setTimeout 处理 最好的解决方法是 次校验函数在文件上传成功的回调函数之后执行
                setTimeout(()=>{
                    if(!this.img.viewImg.length){
                        callback(new Error('请选择一张导读图片'));
                    }else{
                        callback()
                    }     
                },1000);
            };
            const validatorBgpic = (rule,value,callback)=>{
                setTimeout(()=>{
                    if(!this.bgimg.viewImg.length){
                        callback(new Error('请选择一张背景图片'));
                    }else{
                        callback();
                    }
                },1000);
            };
            const validatorVideoCover = (rule,value,callback)=>{
                setTimeout(()=>{
                    if(!this.videoCover.viewImg.length){
                        callback(new Error('请选择一张视频封面图片'));
                    }else{
                        callback();
                    }
                },2500);
            };
            const validatorBookCover = (rule,value,callback)=>{
                setTimeout(()=>{
                    if(!this.bookCover.viewImg.length){
                        callback(new Error('请选择一张绘本封面图片'));
                    }else{
                        callback();
                    }
                },1000);
            };
            const validatorAudio = (rule,value,callback)=>{
                setTimeout(()=>{
                    if(!this.audio.audioList.length){
                        callback(new Error('请选择一个音频文件'));
                    }else{
                        callback();
                    }
                },1000);
            };
            const validatorVideo = (rule,value,callback)=>{
                setTimeout(()=>{
                    if(!this.video.videoList.length){
                        callback(new Error('请选择一个视频文件'));
                    }else{
                        callback();
                    }
                },1000);
            };
            const validatorBook = (rule,value,callback)=>{
                setTimeout(()=>{
                    if(!this.relatedBook.orid){
                        callback(new Error('请配置绘本'));
                    }else{
                        callback();
                    }
                },1000);
            };
            

            return {
                modalswitch:false,
                modalbook:false,
                totalchildtheme:0,
                idslist:[],
                currentPageSize:10,
                preview:false,
                markData:'',
                markDataLength:0,
                markDataDescLength:0,
                previewUrl:'',
                isNew:true,//新建 or 修改
                undoid:'',
                showUndo:false,
                descTipFlag:false,
                guideTipFlag:false,
                buttonDisabled:false,
                bookCurrentPage:1,
                formItem: {
                    subThemeName:'',
                    subThemeDesc:'',
                    subThemeArticle:'',
                    picture:'',
                    audio:'',
                    bgpic:'',
                    video:'',
                    videoCover:'',
                    bookCover:''
                },
                ruleValidate: {
                    subThemeName: [
                        { required: true, message: '名称不能为空', trigger: 'blur' },
                        { type: 'string', max: 20, message: '名称最多20字', trigger: 'blur' }
                    ],
                    subThemeDesc: [
                        { required: true, message: '请输入简介', trigger: 'blur' },
                        { type: 'string', max: 100, message: '简介长度不能超过100', trigger: 'blur' }
                    ],
                    subThemeArticle: [
                        { required: true, message: '请输入导读文章', trigger: 'blur' },
                        { type: 'string', max: 1000, message: '导读文章字数不能超过1000', trigger: 'blur' }
                    ],
                    picture: [
                        { required: true, validator: validatorPicture, trigger: 'change' }
                    ],
                    audio: [
                        { required: true, validator: validatorAudio, trigger: 'change' }
                    ],
                    bgpic: [
                        { required: true, validator: validatorBgpic, trigger: 'change' }
                    ],
                    video: [
                        { required: true, validator: validatorVideo, trigger: 'change' }
                    ],
                    videoCover: [
                        { required: true, validator: validatorVideoCover, trigger: 'change' }
                    ],
                    book: [
                        { required:true, validator: validatorBook, trigger: 'blur' }
                    ],
                    bookCover:[
                        { required: true, validator: validatorBookCover, trigger:'change'}
                    ]
                },
                formInlineBook: {
                    orid: '',
                    bookName: ''
                },
                img:{
                    cover:{
                        status:'',
                        url:'',
                        name:'',
                        filename:''
                    },
                    defaultImgList:[],
                    detailImgList:[],
                    options:null,
                    query:{},
                    format:['jpg','jpeg','png'],
                    action:'http://xb-3sc.oss-cn-hangzhou.aliyuncs.com',
                    viewHost:'http://xb-3sc.xingbook.com/xb-3sc/',
                    viewImg:[],
                    visible:false,
                    currentFileName:''
                },
                bgimg:{
                    cover:{
                        status:'',
                        url:'',
                        name:'',
                        filename:''
                    },
                    defaultImgList:[],
                    detailImgList:[],
                    options:null,
                    query:{},
                    format:['jpg','jpeg','png'],
                    action:'http://xb-3sc.oss-cn-hangzhou.aliyuncs.com',
                    viewHost:'http://xb-3sc.xingbook.com/xb-3sc/',
                    viewImg:[],
                    visible:false,
                    currentFileName:''
                },
                audio:{
                    query:{},
                    id:'',
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
                    audioList:[],
                    viewHost:'http://xb-vod.oss-cn-hangzhou.aliyuncs.com/audio/'
                },
                videoCover:{
                    cover:{
                        status:'',
                        url:'',
                        name:'',
                        filename:''
                    },
                    options:null,
                    query:{},
                    format:['jpg','jpeg','png'],
                    action:'http://xb-3sc.oss-cn-hangzhou.aliyuncs.com',
                    viewHost:'http://xb-3sc.xingbook.com/xb-3sc/',
                    viewImg:[],
                    currentFileName:''
                },
                bookCover:{
                    cover:{
                        status:'',
                        url:'',
                        name:'',
                        filename:''
                    },
                    options:null,
                    query:{},
                    format:['jpg','jpeg','png'],
                    action:'http://xb-3sc.oss-cn-hangzhou.aliyuncs.com',
                    viewHost:'http://xb-3sc.xingbook.com/xb-3sc/',
                    viewImg:[],
                    currentFileName:''
                },
                video:{
                    query:{},
                    id:'',
                    format:['mp4'],
                    videoFlag:false,
                    action:'http://xingbookvideo.oss-cn-hangzhou.aliyuncs.com',
                    options:null,
                    file:{
                        filename:'',
                        size:0,
                        name:'',
                        duration:0
                    },
                    viewHost:'http://xingbookvideo.oss-cn-hangzhou.aliyuncs.com/video/',
                    currentFileName:'',
                    videoList:[]
                },
                childListColumn: [
                    // {
                    //     type: 'selection',
                    //     width:60,
                    //     align:'center'
                    // },
                    {
                        title: '主题内容',
                        key: 'name'
                    },
                    {
                        title: '导读音频',
                        key: 'audio_uri',
                        align:'center',
                        render:(h,params)=>{
                            return h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    on:{
                                        click:()=>{
                                            this.showAudioModal(params.row);
                                        }
                                    }
                                },'查看');
                        }
                    },
                    {
                        title: '教学视频',
                        key: 'video_uri',
                        align:'center'
                        ,render: (h,params) => {
                            return h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    on:{
                                        click:()=>{
                                            this.showVideoModal(params.row);
                                        }
                                    }
                                },'查看');
                        }
                    },
                    {
                        title: '配套绘本',
                        key: 'book_name',
                        align:'center',
                        render:(h,params) => {
                            if(params.row.book_uri){
                                let _book_orid = params.row.book_uri.split('-')[0],
                                    _bood_vers = params.row.book_uri.split('-')[1];
                                return h('a',{
                                    attrs:{
                                        href:'http://xb-3sc.xingbook.com/ott/t/index.html?orid='+_book_orid+'&v='+_bood_vers+'&namespace=parent&fromWeb=yes',
                                        target:'_blank'
                                    }
                                },params.row.book_name);
                            }
                        }
                    },
                    {
                        title: '关联状态',
                        key: 'rel',
                        align:'center',
                        render: (h, params) => {
                            let txt = params.row.rel?'已关联':'未关联';
                            if(params.row.rel){
                                return h('div', [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small',
                                            shape: "circle"
                                        },
                                        on:{
                                            click:()=>{
                                                this.showRelationship(params.row);
                                            }
                                        }
                                    }, txt)
                                ]);
                            }else{
                                return h('div', txt);
                            }

                        }
                    },
                    {
                        title: '创建时间',
                        key: 'create_time'
                    },
                    {
                        title: '修改时间',
                        key: 'modify_time'
                    }
                ],
                childList: [],
                bookListColumn:[
                    {
                        title: '绘本名称',
                        key: 'title'
                    },
                    {
                        title:'orid',
                        key:'id'
                    }
                ],
                bookList:[],
                bookId:'',
                bookTotal:0,
                relatedBook:{
                    showFlag:false,
                    title:'',
                    orid:'',
                    cover:''
                },
                intervalTick:0
            }
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
                
                this.bgimg.action = res.data.host;
                this.bgimg.options = res.data;

                this.videoCover.action = res.data.host;
                this.videoCover.options = res.data;

                this.bookCover.action = res.data.host;
                this.bookCover.options = res.data;
            });
            getAliyunToken('xingbookvideo').then(res=>{
                if(res.resultCode != 0) return;
                this.video.action = res.data.host;
                this.video.options = res.data;
            });
        },
        mounted:function(){//sub-theme list data
            var that = this;
            this._utilGetThemeListData(1,10);           
        },
        computed: {
            compiledMarkdown: function () {
              return marked(this.formItem.subThemeArticle, { sanitize: true })
            },
            compiledMarkdownDesc: function () {
              return marked(this.formItem.subThemeDesc, { sanitize: true })
            }
        },
        methods:{
            checkWords:function(){
                this.$refs['formValidate'].validate((valid)=>{
                });
            },
            checkMkDown:function(val,render){},
            imgFormatError:function(file){
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
                });
            },
            audioFormatError:function(file){
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 mp3 格式的音频。'
                });
            },
            bgimgFormatError:function(file){
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
                });
            },
            videoCoverFormatError:function(file){
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
                });  
            },
            bookCoverFormatError:function(file){
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
                });  
            },
            videoFormatError:function(file){
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 mp4 格式的视频。'
                });  
            },
            updateMarkData:function(e){
                this.formItem.subThemeArticle = e.target.value;
                this.markDataLength = this.formItem.subThemeArticle.replace(/[\r\n]/g,"").length;
            },
            updateMarkDataDesc:function(e){
                this.formItem.subThemeDesc = e.target.value;
                this.markDataDescLength = this.formItem.subThemeDesc.replace(/[\r\n]/g,"").length;
            },
            emptyEverything(){
                //清空之前的数据
                this.formItem.subThemeName = '';
                this.formItem.subThemeDesc = '';
                this.formItem.subThemeArticle = '';

                this.img.viewImg = [];//情况各种图片记录
                this.img.currentFileName = '';

                this.bgimg.viewImg = [];
                this.bgimg.currentFileName = '';

                this.videoCover.viewImg = [];
                this.videoCover.currentFileName = '';

                this.bookCover.viewImg = [];
                this.bookCover.currentFileName = '';

                this.audio.audioFlag = false;
                this.audio.audioList = [];//有且只能有一个音频

                this.video.videoFlag = false;
                this.video.videoList = [];

                this.relatedBook.showFlag = false; //清空绘本配置
                this.relatedBook.title = '';
                this.relatedBook.orid = '';
                this.relatedBook.cover = '';

                this.buttonDisabled = false;

                this.$refs['formValidate'].resetFields();                
            },
            showModal:function(){//新建子主题 清空一切历史数据
                this.modalswitch = true;
                this.isNew = true;
                this.emptyEverything();
            },
            subThemeListPage:function(pageNo){
                this._utilGetThemeListData(pageNo,10);
            },
            subThemeListPageCountChanged:function(pageSize){
                this.currentPageSize = pageSize;
                this._utilGetThemeListData(1,pageSize);
            },
            _utilGetThemeListData:function(pageNo,pageSize){
                let that = this;
                getRawJson('/theme/child/list?page_num='+pageNo+'&rows='+pageSize).then(function(res){
                    if(!res.resultCode && res.data && res.data.list.length){
                        that.totalchildtheme = res.data.count;
                        that.childList = res.data.list;
                    }
                });   
            },
            _utilGetBookData:function(pageNo){
                let that = this;
                getRawJson('/theme/child/books?page_num='+pageNo+'&rows=10').then(function(res){
                    if(!res.resultCode && res.data && res.data.list.length){
                        let _booklist = [];
                        res.data.list.forEach(function(o,i){
                            _booklist.push({
                                title:o.title,
                                id:o.id,
                                cover:o.cover
                            })
                        });
                        that.bookTotal = res.data.count;
                        that.bookList = _booklist;
                    }
                });   
            },
            configBook:function(){
                this.modalbook = true;
                this.bookCurrentPage = 1;
                this._utilGetBookData(1);
            },
            bookPage:function(pageNo){//用户切换到的页码数字
                this._utilGetBookData(pageNo);
            },
            selectCurrentBookRow:function(row){//单选某一行数据 选择一个绘本进行配置
                console.log(row);
                this.relatedBook.title = row.title;
                this.relatedBook.orid = row.id;
                this.relatedBook.cover = row.cover;
                //设置存在的绘本图片

                if(row.cover){
                    this.bookCover.viewImg = [row.cover];
                    let cover_arr = row.cover.split('/');
                    this.bookCover.currentFileName = cover_arr[cover_arr.length-1];
                }else{
                    this.bookCover.viewImg = [];
                    this.bookCover.currentFileName = '';
                }
                
            },
            searchBook:function(res){//根据orid name搜索绘本
                let that = this;
                getRawJson('/theme/child/books?page_num=1&rows=10&orid='+that.formInlineBook.orid+'&name='+that.formInlineBook.bookName).then(function(res){
                    if(!res.resultCode && res.data){
                        let _booklist = [];
                        res.data.list.forEach(function(o,i){
                            _booklist.push({
                                title:o.title,
                                id:o.id,
                                cover:o.cover
                            })
                        });
                        that.bookTotal = res.data.count;
                        that.bookList = _booklist;
                    }
                });
            },
            handleSubmit (name) {
                let that = this;
                that.buttonDisabled = true;//禁用button 关闭modal 防止多次点击 重复新建
                that.$refs[name].validate((valid) => {
                    if (valid) {
                        postJson('/theme/child/add',{
                            "name":that.formItem.subThemeName,
                            "brief":that.formItem.subThemeDesc,
                            "bg_img":that.bgimg.currentFileName ? that.bgimg.viewHost+that.bgimg.currentFileName : '',
                            "audio_file":{
                                "file_name":that.audio.file.name,
                                "size":that.audio.file.size,
                                "uri":that.audio.viewHost+that.audio.file.filename,
                                "duration":that.audio.file.duration,
                                "cover":that.img.currentFileName?that.img.viewHost+that.img.currentFileName:'',
                                "guide":that.formItem.subThemeArticle
                            },
                            "video_file":{
                                "file_name":that.video.currentFileName,
                                "size":that.video.file.size,
                                "uri":that.video.viewHost+that.video.file.filename,
                                "duration":that.video.file.duration,
                                "cover":that.videoCover.currentFileName?(that.videoCover.viewHost+that.videoCover.currentFileName):''
                            },
                            "book_file":{
                                "id":that.relatedBook.orid,
                                "file_name":that.relatedBook.title,
                                "cover":that.bookCover.viewHost+that.bookCover.currentFileName
                            }
                        },false).then(function(res){
                            if(!res.resultCode){//添加成功，刷新列表
                                that.$Message.success('新增子主题成功！');
                                that._utilGetThemeListData(1,that.currentPageSize);
                                that.modalswitch = false;
                            }else{
                                that.$Message.error('新建子主题失败，请重试');
                            }
                        });
                    } else {
                        that.buttonDisabled = false;
                        that.$Message.error('表单验证失败!无法新增子主题');
                    }
                })
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            },
            addNewTheme () {
            },
            cancelNewTheme () {
            },
            bookok:function(){
                if(this.relatedBook.orid){
                    this.relatedBook.showFlag = true;//显示关联的绘本 关闭modal
                }else{//没有选择绘本 禁止提交关闭  
                    this.$Modal.error({
                        content:'请必须选择一个绘本'
                    });
                }
            },
            bookcancel:function(){},
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
            imgUploadOK:function(response, file, fileList){//图片只能上传一张
                this.img.viewImg = [];
                this.img.viewImg.push(this.img.viewHost + this.img.currentFileName);
            },
            imgUploadEorror:function(error){
                this.$Message.info('图片上传失败 请重试');
            },
            bgimgBeforeUpload:function(bgimg){

                if(typeof this.bgimg.options != 'object'){
                    this.$Message.error('配置信息还未生成，请稍后!');
                    return false;
                }
                let filename = this.createFilename(bgimg);
                this.bgimg.currentFileName = filename;

                this.bgimg.query = {
                    "OSSAccessKeyId":this.bgimg.options.accessid,
                    "policy":this.bgimg.options.policy,
                    "Signature":this.bgimg.options.signature,
                    "success_action_status":'200',
                    "key":this.bgimg.options.dir + filename
                }
                return new Promise( (resolve,reject) => {
                    setTimeout(() => {
                        resolve()
                    },100)
                })
            },
            onBgimgSuccess:function(response, file, fileList){
                this.bgimg.viewImg = [];
                this.bgimg.viewImg.push(this.bgimg.viewHost + this.bgimg.currentFileName);
            },
            bgimgUploadError:function(error){
                this.$Message.info('背景图片上传失败 请重试');
            },
            audioBeforeUpload:function(file){
                let uuid = uuidV4();

                let name = file.name.split('.');
                let type = name[name.length - 1];

                if(typeof this.audio.options != 'object'){
                    this.$Message.error('配置信息还未生成，请稍后!');
                    return false;
                };

                let filename = uuid + '.' + type;
                this.audio.file.filename = filename;
                this.audio.file.size = file.size;
                this.audio.file.name = name[0];

                this.audio.query = {
                    "OSSAccessKeyId":this.audio.options.accessid,
                    "policy":this.audio.options.policy,
                    "Signature":this.audio.options.signature,
                    "success_action_status":'200',
                    "key":this.audio.options.dir + filename
                }
                return new Promise( (resolve,reject) => {
                    setTimeout(() => {
                        resolve()
                    },100)
                })
            },
            getDuration:function(res){
                this.audio.file.duration = res.srcElement.duration;
            },
            audioUploadError:function(error, file, fileList){
                this.$Message.info('音频上传失败 请重试');
            },
            onAudioSuccess(response, file, fileList){
                this.audio.audioFlag = true;//上次音频成功，显示audio播放器
                this.audio.audioList = [];//有且只能有一个音频
                this.audio.audioList.push(this.audio.viewHost+this.audio.file.filename);
            },
            onAudioError(error, file, fileList){
                this.$Message.error('音频上传失败！');
            },
            videoCoverBeforeUpload:function(videoCover){
                if(typeof this.videoCover.options != 'object'){
                    this.$Message.error('配置信息还未生成，请稍后!');
                    return false;
                }
                let filename = this.createFilename(videoCover);
                this.videoCover.currentFileName = filename;
                //this.videoCover.cover.filename = filename.split('.')[0];

                this.videoCover.query = {
                    "OSSAccessKeyId":this.videoCover.options.accessid,
                    "policy":this.videoCover.options.policy,
                    "Signature":this.videoCover.options.signature,
                    "success_action_status":'200',
                    "key":this.videoCover.options.dir + filename
                }
                return new Promise( (resolve,reject) => {
                    setTimeout(() => {
                        resolve()
                    },100)
                })
            },
            getVideoDuration:function(res){
                this.video.file.duration = res.srcElement.duration;
            },
            videoCoverUploadError:function(error, file, fileList){
                this.$Message.error('上传视频封面图片失败！请重试');
            },
            onvideoCoverSuccess:function(response, file, fileList){
                this.videoCover.viewImg = [];
                this.videoCover.viewImg.push(this.videoCover.viewHost + this.videoCover.currentFileName);
            },
            videoBeforeUpload:function(video){
                let uuid = uuidV4(),name = video.name.split('.'),type=name[name.length-1];
                let filename = uuid + '.' + type;
                this.video.file.filename = filename;

                this.video.file.size = video.size;
                this.video.currentFileName = name[0];

                this.video.query = {
                    "OSSAccessKeyId":this.video.options.accessid,
                    "policy":this.video.options.policy,
                    "Signature":this.video.options.signature,
                    "success_action_status":'200',
                    "key":this.video.options.dir + filename
                }
                return new Promise(function(resolve,reject){
                    setTimeout(() => {
                        resolve()
                    },100)
                });
            },
            videoUploadError:function(error){
                this.$Message.info('视频上传失败 请重试');
            },
            handleVideoMaxSize:function(file){
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件 ' + file.name + ' 太大，不能超过 500M。'
                });
            },
            videoUploadOk:function(response,file,fileList){
                this.video.videoFlag = true;//上次视频成功，显示video播放器
                
                //获取截图 等待截图完成
                window.setTimeout(()=>{
                    this.videoCover.currentFileName = this.video.file.filename.split('.')[0] + '.jpg';
                    this.videoCover.viewImg = [];
                    this.videoCover.viewImg.push(this.videoCover.viewHost + this.videoCover.currentFileName);
                },2000);

                this.video.videoList = [];
                this.video.videoList.push(this.video.viewHost+this.video.file.filename);
            },
            videoCoverLoadOk:function(){
                //window.clearInterval(this.intervalTick);
            },
            bookCoverBeforeUpload:function(bookCover){
                if(typeof this.bookCover.options != 'object'){
                    this.$Message.error('配置信息还未生成，请稍后!');
                    return false;
                }
                let filename = this.createFilename(bookCover);
                this.bookCover.currentFileName = filename;
                //this.bookCover.cover.filename = filename.split('.')[0];

                this.bookCover.query = {
                    "OSSAccessKeyId":this.bookCover.options.accessid,
                    "policy":this.bookCover.options.policy,
                    "Signature":this.bookCover.options.signature,
                    "success_action_status":'200',
                    "key":this.bookCover.options.dir + filename
                }
                return new Promise( (resolve,reject) => {
                    setTimeout(() => {
                        resolve()
                    },100)
                })  
            },
            bookCoverUploadError:function(error, file, fileList){
                this.$Message.error('上传绘本封面图片失败！请重试');
            },
            onbookCoverSuccess:function(response, file, fileList){
                this.bookCover.viewImg = [];
                this.bookCover.viewImg.push(this.bookCover.viewHost + this.bookCover.currentFileName);
            },
            handleRemoveAudio(){
                this.audio.file = {}
            },
            createFilename(file){
                let uuid = uuidV4();
                let name = file.name.split('.');
                let type = name[name.length - 1];
                return uuid + '.' + type;
            },
            showRelationship:function(row){
                let datalist = [];
                getRawJson('/theme/child/p',{id:row.id}).then(res=>{
                    if(!res.resultCode){
                        if(res.data && res.data.length){
                            res.data.forEach(function(o,i){
                                datalist.push({
                                    name:o.name
                                });
                            });
                            this.$Modal.info({
                                title:'查看关联状态',
                                render: (h,params) => {
                                    return h('Table',{
                                        props:{
                                            columns:[{
                                                title:'已经关联主题',
                                                key:'name'
                                            }],
                                            data:datalist
                                        }
                                    })
                                }
                            }); 
                        }else{
                            this.$Modal.info({
                                title:'查看关联状态',
                                content:'暂时无关联主题'
                            });
                        }
                    }else{
                        this.$Message.error('获取关联状态失败');
                    }
                });
            },
            showVideoModal:function(row){
                this.$Modal.info({
                    title:'播放视频',
                    render:(h,params)=>{
                        return h('video',{
                            attrs:{
                                'src':row.video_uri,
                                'controls':'controls',
                                'width':'100%'
                            }
                        })
                    }
                });
            },
            showAudioModal:function(row){
                this.$Modal.info({
                    title:'播放音频',
                    render:(h,params)=>{
                        return h('div',{
                            attrs:{
                                'class':'modalWrapper'
                            }
                        },[
                            h('audio',{
                                attrs:{
                                    'src':row.audio_uri,
                                    'controls':'controls',
                                    'width':'100%'
                                }
                            })
                        ]);
                    }
                });
            },
            selectHandler:function(row){
                this.idslist = [];
                this.idslist.push(row.id);
            },
            deleteMe:function(){
                let that = this;
                if(that.idslist.length){
                    postJson('/theme/child/remove',{id:that.idslist.join()},false).then(function(res){
                        if(!res.resultCode){//删除，重新请求最新数据
                            //记录下删除的id 以便撤销
                            that.undoid = that.idslist.join();
                            that.showUndo = true;
                            getRawJson('/theme/child/list',{'page_num':1,'rows':20}).then(function(res){
                                if(!res.resultCode){
                                    that.totalchildtheme = res.data.count;
                                    that.childList = res.data.list;
                                }
                            });
                        }else{
                            that.$Modal.info({
                                title:'操作结果',
                                content:res.resultMsg
                            });
                        }
                    });
                }else{
                    that.$Message.error('请选择要删除的数据行！');
                }
            },
            modifyMe:function(){
                let that = this;
                that.isNew = false;
                that.buttonDisabled = false;
                
                this.emptyEverything();

                if(that.idslist && that.idslist.length){
                    if(that.idslist.length==1){//只能单条修改
                        //请求此条数据内容
                        getRawJson('/theme/child/info',{id:that.idslist.join()}).then(function(res){
                            if(!res.resultCode){
                                that.modalswitch = true;
                                that.relatedBook.showFlag = true;//绘本配置信息

                                that.formItem.subThemeName = res.data.name;
                                that.formItem.subThemeDesc = res.data.brief;
                                that.formItem.subThemeArticle = res.data.audio_file.audio_guide;

                                that.relatedBook.title = res.data.book_file.book_name;
                                that.relatedBook.orid  = res.data.book_file.book_id;
                                
                                //视频的封面图片需要特殊处理 将服务端自动截屏的图片 设置到data.videoCover.currentFileName 然后update的时候从此字段获取
                                let vcover = res.data.video_file.video_cover,vcover_arr=vcover.split('/'),
                                    bookcover=res.data.book_file.book_cover,bookcover_arr=bookcover.split('/'),

                                    audiouri = res.data.audio_file.audio_uri,audiouri_arr=audiouri.split('/'),
                                    videouri = res.data.video_file.video_uri,videouri_arr=videouri.split('/'),
                                    img_pic = res.data.audio_file.audio_cover,
                                    bgimg_pic = res.data.bg_img;

                                if(img_pic){
                                    let img_arr =  img_pic.split('/');
                                    that.img.viewImg = [img_pic];
                                    that.img.currentFileName = img_arr[img_arr.length-1];
                                }else{
                                    that.img.viewImg = [];
                                    that.img.currentFileName = '';
                                }

                                if(bgimg_pic){
                                    let bgimg_arr =  bgimg_pic.split('/');
                                    that.bgimg.viewImg = [bgimg_pic];
                                    that.bgimg.currentFileName = bgimg_arr[bgimg_arr.length-1];
                                }else{
                                    that.bgimg.viewImg = [];
                                    that.bgimg.currentFileName = '';
                                }

                                that.videoCover.viewImg = [vcover];
                                that.videoCover.currentFileName = vcover_arr[vcover_arr.length-1];

                                that.bookCover.viewImg = [bookcover];
                                that.bookCover.currentFileName = bookcover_arr[bookcover_arr.length-1];

                                
                                that.audio.audioList = [audiouri];//for validor check
                                that.video.videoList = [videouri];
                                that.audio.audioFlag = true;//show ...
                                that.video.videoFlag = true;

                                that.audio.file.filename = audiouri_arr[audiouri_arr.length-1];
                                that.video.file.filename = videouri_arr[videouri_arr.length-1];


                                that.audio.id = res.data.audio_file.audio_id;
                                that.video.id = res.data.video_file.video_id;
                                that.bookId = res.data.book_file.book_id;
                            }else{
                                that.$Message.error('获取此子主题内容数据失败！请刷新重试');
                            }
                        });
                    }else{
                        that.$Message.error('只能修改单条数据行！');
                    }
                }else{
                    that.$Message.error('请选择要修改的数据行!');
                }
            },
            handleModifySubmit:function(form){
                let that = this;
                that.buttonDisabled = true;//禁止重复修改提交
                that.$refs[form].validate((valid) => {
                    if (valid) {
                        console.log('try get videoCover',that.videoCover.currentFileName);
                        console.log('try get bookCover',that.bookCover.currentFileName);
                        console.log('try get img',that.img.currentFileName);
                        console.log('try get bg_img',that.bgimg.currentFileName);
                        that.buttonDisabled = true;//禁用button 关闭modal 防止多次点击 重复新建

                        postJson('/theme/child/update',{
                            "id":that.idslist.join(),
                            "name":that.formItem.subThemeName,
                            "brief":that.formItem.subThemeDesc,
                            "bg_img":that.bgimg.currentFileName?that.bgimg.viewHost+that.bgimg.currentFileName:'',
                            "audio_file":{
                                "id":that.audio.id,
                                "file_name":that.audio.file.name,
                                "size":that.audio.file.size,
                                "uri":that.audio.viewHost+that.audio.file.filename,
                                "duration":that.audio.file.duration,
                                "cover":that.img.currentFileName?that.img.viewHost+that.img.currentFileName:'',
                                "guide":that.formItem.subThemeArticle
                            },
                            "video_file":{
                                "id":that.video.id,
                                "file_name":that.video.currentFileName,
                                "size":that.video.file.size,
                                "uri":that.video.viewHost+that.video.file.filename,
                                "duration":that.video.file.duration,
                                "cover":that.videoCover.viewHost+that.videoCover.currentFileName
                            },
                            "book_file":{
                                "id":that.relatedBook.orid,
                                //"orid":that.relatedBook.orid,
                                "file_name":that.relatedBook.title,
                                "cover":that.bookCover.viewHost+that.bookCover.currentFileName
                            }
                        },false).then(function(res){
                            if(!res.resultCode){//修改成功，刷新列表
                                that.$Message.success('修改子主题成功！');
                                that._utilGetThemeListData(1,that.currentPageSize);
                                that.modalswitch = false;
                            }else{
                                that.$Message.error('修改子主题失败，请重试');
                            }
                        });

                    } else {
                        that.buttonDisabled = false;
                        that.$Message.error('表单验证失败!无法修改子主题');
                    }
                })
            },
            handleView (url) {
                this.previewUrl = url;
                this.preview = true;
            },
            handleRemove (file) {
                // 从 upload 实例删除数据
                const fileList = this.$refs.upload.fileList;
                this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
            },
            undoDelete:function(){
                let that = this;
                postJson('/theme/child/undo/remove',{id:that.undoid},false).then(function(res){
                    getRawJson('/theme/child/list',{'page_num':1,'rows':20}).then(function(res){
                        if(!res.resultCode){
                            that.totalchildtheme = res.data.count;
                            that.childList = res.data.list;
                            that.showUndo = false;

                            that.idslist = [];//清空选中的行
                        }
                    });
                });
            },
            deleteAudio:function(){
                this.audio.audioFlag = false;
                this.audio.audioList.length = 0;
            },
            deleteVideo:function(){
                this.video.videoFlag = false;
                this.video.videoList.length = 0;
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
    #editor textarea,#editorDesc textarea{
    width: 100%;
    max-width: 100%;
    height: 94px;
    min-height: 94px;
    max-height: 115px;
    border: 1px solid #ed3f14;
    max-width: 100%;
    height: auto;
    vertical-align: bottom;
    font-size: 14px;
    line-height: 1.5;
    padding: 4px 7px;
    font-size: 12px;
    border: 1px solid #dddee1;
    border-radius: 4px;
    color: #495060;
    background-color: #fff;
    background-image: none;
    position: relative;
    cursor: text;
    transition: border .2s ease-in-out,background .2s ease-in-out,box-shadow .2s ease-in-out;
    }
    #editor textarea:focus, #editorDesc textarea:focus {
        outline: 0;
        border-color: #57a3f3;
        box-shadow: 0 0 0 2px rgba(45,140,240,.2);
    }
    code{
        white-space: pre-wrap;
    }
    #markedResultDesc, #markedResult{
        word-break: break-word;
    }
    .layout{
        padding-bottom: 120px;
    }
</style>