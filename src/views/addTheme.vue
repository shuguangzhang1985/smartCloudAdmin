<template>
    <Form :rules="ruleValidate" :model="formValidate" :label-width="80" ref='formValidate'>
        <Form-item label="主题名称" prop='name'>
            <Input v-model="formValidate.name" placeholder="建议20个字以内" ></Input>
        </Form-item>
        <Form-item label="简介：" prop='brief'>
            <div id="editor">
                <textarea id="markedArea" :value="formValidate.brief" @input="updateBrief" v-on:blur="checkWords"></textarea>
                <div ref='markedResultDesc' v-html="compiledBriefMarkdown"></div>
            </div>
            <div style='color:red;'>{{briefTipe}}</div>
        </Form-item>
            

        <Form-item label="导读图片" prop="cover">
                    <div class="audio-cover-preview" v-show="img.cover.name">
                        <template v-if="img.cover.status === 'finished'">
                            <img :src="img.viewHost + img.cover.name">
                            <div class="audio-cover-method">
                                <Icon type="ios-trash-outline" @click.native="handleRemoveCover"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="audio.file.showProgress" :percent="audio.file.percentage" hide-info></Progress>
                        </template>
                    </div>
                    <Upload
                        v-show="!img.cover.name"
                        ref="coverUpload"
                        :show-upload-list="false"
                        :on-success="onCoverSuccess"
                        :data="img.query"
                        :format="img.format"
                        :max-size="2048"
                        :on-exceeded-size="onMaxSize"
                        :before-upload="beforeCoverUpload"
                        :on-progress="onCoverProgress"
                        :action="img.action"
                        type="drag"
                        style="display: inline-block;width:100%;">
                        <div style="width: 100%;height:58px;line-height: 58px;">
                            <Icon type="camera" size="30"></Icon>
                        </div>
                    </Upload>
                    <div>
                        <p>尺寸：250*250<br/>作为音频展示、分享图标、支持jpg</p>
                    </div>
                </Form-item>
        <Form-item label="导读音频" prop='uri'>
            <div class="upload-main">
                <div class="audio-preview" v-show="audio.file.name">
                    <template v-if="audio.file.status === 'finished'">
                        <div class="audio-player">
                            <audio @loadedmetadata="getAudioData" ref="audio" :src="audio.viewHost + audio.file.filename" preload="preload" controls="controls"></audio>
                        </div>
                        <div class="audio-method">
                            <Icon type="ios-trash-outline" @click.native="handleRemoveAudio"></Icon>
                        </div>
                    </template>
                    <template v-else>
                        <Progress v-if="audio.file.showProgress" :percent="audio.file.percentage" hide-info></Progress>
                    </template>
                </div>
                <Upload
                    v-show="!audio.file.name"
                    multiple
                    header="header"
                    type="drag"
                    accept="audio/*"
                    :show-upload-list="false"
                    :format="audio.format"
                    :data="audio.query"
                    :action="audio.action"
                    :before-upload="beforeAudioUpload"
                    :on-progress="onAudioProgress"
                    :on-success="onAudioSuccess"
                    :on-error="onAudioError">
                    <div style="padding: 20px 0">
                        <Icon type="ios-cloud-upload" size="100" style="color: #3399ff"></Icon>
                        <p>点击或将文件拖拽到这里上传</p>
                    </div>
                </Upload>
            </div>
            <div>
                <p>{{audio.file.name}}</p>
                <p>支持扩展名：.mp3</p>
            </div>
        </Form-item>
        <Form-item label="导读文章" prop='guide'>
            
            <div id="editor">
                <textarea id="markedArea1" :value="formValidate.guide" @input="updateGuide" v-on:blur="checkWords1"></textarea>
                <div id="markedResult" ref="markedResult" v-html="compiledGuideMarkdown"></div>
                <div style='color:red;'>{{guideTipe}}</div>
            </div>
        </Form-item>
         <Form-item label="背景图片" prop="bg_img">
            <div class="audio-cover-preview" v-show="img.bg_img.name">
                <template v-if="img.bg_img.status === 'finished'">
                    <img :src="img.viewHost + img.bg_img.name">
                    <div class="audio-cover-method">
                        <Icon type="ios-trash-outline" @click.native="handleRemoveBgImg"></Icon>
                    </div>
                </template>
                <template v-else>
                    <Progress v-if="img.bg_img.showProgress" :percent="img.bg_img.percentage" hide-info></Progress>
                </template>
            </div>
            <Upload
                v-show="!img.bg_img.name"
                ref="coverUpload"
                :show-upload-list="false"
                :on-success="onBgImgSuccess"
                :data="img.query"
                :format="img.format"
                :max-size="2048"
                :on-exceeded-size="onMaxSize"
                :before-upload="beforeBgImgUpload"
                :on-progress="onBgImgProgress"
                :action="img.action"
                type="drag"
                style="display: inline-block;width:100%;">
                <div style="width: 100%;height:58px;line-height: 58px;">
                    <Icon type="camera" size="30"></Icon>
                </div>
            </Upload>
            <div>
                <p>尺寸：750*400 支持jpg</p>
            </div>
        </Form-item>
        <Form-item label="背景颜色" prop="color">
            <Input v-model="formValidate.color"  type="text"  placeholder="设置背景设置，默认为白色（FFFFFF）"></Input>
        </Form-item>
        <Form-item>
            <div style='text-align:right'>
                <Button type="primary" @click="handleSubmit('formValidate')" >提交</Button>
                <Button type="ghost" @click="handleClose()" style="margin-left: 8px">取消</Button>
            </div>
        </Form-item>
    </Form>
    
</template>
<script>
    import { getThemeList,getAliyunToken, postFormData,modifyFormData} from '../libs/api'
    import AudioMethods from '../mixins/audio-upload-methods'
    import ImgMethods from '../mixins/img-upload-methods'
    import uuidV4 from 'uuid/v4'
    import * as resType from '../libs/res-type'
    import marked from 'marked'

   // import Util from '../libs/util';

    export default {
        mixins:[AudioMethods,ImgMethods],
        created(){
              getAliyunToken('xb-vod').then(res => {
                if(res.resultCode != 0) return;
                this.audio.action = res.data.host;
                this.audio.options = res.data;
                this.options_status += 1;
            })
            getAliyunToken('xb-3sc').then(res => {
                if(res.resultCode != 0) return;
                this.img.action = res.data.host;
                this.img.options = res.data;
                this.options_status += 1;
            })
            
        },
        data () {
            const validateColor = (rule, value, callback) => {
                if(value!=''){
                    let myRe = /^([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;
                    let myArray = myRe.test(value)
                    console.log(myArray);
                    if(!myArray){
                        return callback(new Error('请输入RGB格式的颜色'));
                    }else{
                        callback()
                    }
                }else{
                     callback();
                }
                
            };
          
            return {
                sss: '# hello',
                options_status:0,
                modal1: false,
                markedResultLength:0,
                markedResultDescLength:0,
                guideTipe:'',
                briefTipe:'',
                formValidate:{
                    name: '',
                    brief:"",
                    bg_img: '',
                    color:'',
                    file_name:"",
                    size:"",
                    uri:"",
                    guide:"",
                    duration:"",
                    cover:""
                },
                formPostData: {
                    name: '',
                    brief:"",
                    bg_img: '',
                    color:'',
                    audio_file:{
                        file_name:"",
                        size:"",
                        uri:"",
                        guide:"",
                        duration:"",
                        cover:""
                    },
                },
                
                imgName: '',
                uploadList: [],
                ruleValidate: {
                    name: [
                        { required: true, message: '名称不能为空', trigger: 'blur' },
                        { max: 20, message: '名称长度不能超过20', trigger: 'blur'}
                    ],
                    brief: [
                        { required: true, message: '请输入简介', trigger: 'blur' },
                        { type: 'string', max: 100, message: '简介长度不能超过100', trigger: 'blur' }
                    ],
                    uri:[
                        { required: true, message: '请上传音频', trigger: 'submit'}
                    ],
                    guide:[
                        { required: true, message: '请上传导读文章', trigger: 'submit'},
                        { type: 'string', max: 1000, message: '导读文章长度不能超过1000', trigger: 'blur' }
                    ],
                    cover:[
                        { required: false, message: '请上传导读图片', trigger: 'blur'}
                    ],
                    
                    bg_img:[
                        { required: false, message: '请上传背景图片', trigger: 'blur'}
                    ]
                    ,
                    color:[
                        {required: false, validator:validateColor,message: '请输入RGB格式的颜色',trigger: 'blur'}
                    ]
                }
            
            }
        },
         
        props:['formData'],
        watch:{
            formData(val,odval){
               this.$refs['formValidate'].resetFields();
                if(val.ifAdd){
                   this.formPostData={
                        name: '',
                        brief:"",
                        bg_img: '',
                        color:'',
                        audio_file:{
                            file_name:"",
                            size:"",
                            uri:"",
                            guide:"",
                            duration:"",
                            cover:""
                        }
                    }
                    this.formValidate={
                        name:'',
                        brief:"",
                        bg_img: '',
                        color:'',
                        file_name:"",
                        size:"",
                        uri:"",
                        guide:"",
                        duration:"",
                        cover:""
                    }
                    this.img.cover={
                        status:'',
                        url:"",
                        name:'',
                        percentage:0,
                        filename:''
                    }
                    this.img.bg_img={
                        status:"",
                        url:'',
                        name:'',
                        percentage:0,
                        filename:""
                    }
                    this.audio.file={
                        filename:'',
                        name:'',
                        response:"",
                        percentage:0,
                        showProgress:true,
                        status:"200"
                    }
                }else{
                    val=val.modifyData;
                    let imgViewHostLen=this.img.viewHost.length;
                    let audioViewHostLen=this.audio.viewHost.length;
                    this.formPostData=val;
                    this.formValidate={
                        cover:val.audio_file.cover,
                        guide:val.audio_file.guide,
                        uri:val.audio_file.uri,
                        file_name:val.audio_file.file_name, 
                        name:val.name,
                        brief:val.brief,
                        bg_img: val.bg_img,
                        color:val.color,
                        size:val.size,
                        duration:val.duration,
                    }
                    this.img.cover={
                        status:"finished",
                        showProgress:true,
                        percentage:0,
                        name:val.audio_file.cover.substring(imgViewHostLen,val.audio_file.cover.length),
                        filename:val.audio_file.file_name
                    };
                    this.img.bg_img={
                        status:"finished",
                        showProgress:true,
                        percentage:0,
                        name:val.bg_img.substring(imgViewHostLen,val.bg_img.length),
                    };
                    this.audio.file={
                        filename:val.audio_file.uri.substring(audioViewHostLen,val.audio_file.uri.length),
                        name:val.audio_file.file_name,
                        response:"",
                        percentage:0,
                        showProgress:false,
                        status:"finished"
                    }
                }
            }
        },
        methods: {
            getAudioData(e){
                this.audio.file.duration = Math.floor(e.target.duration);
                this.formValidate.duration = Math.floor(e.target.duration);
                this.formPostData.audio_file.duration=Math.floor(e.target.duration)
            },
            handleSubmit(form){
                this.$refs[form].validate((valid) => {
                    if (valid) {
                        this.formPostData.name=this.formValidate.name;
                        this.formPostData.color=this.formValidate.color;
                        this.formPostData.brief=this.formValidate.brief;
                        this.formPostData.audio_file.guide=this.formValidate.guide;
                        if(this.formData.ifAdd){
                            
                            postFormData(this.formPostData).then(res =>{
                            
                                if(res.resultCode == 0){
                                    this.$Message.success('提交成功!');
                                    this.formData.getTabData();
                                    this.formData.addModal=false;
                                    
                                }else{
                                    this.$Message.error(res.resultMsg);
                                }
                                
                            })  
                        }else{
                            modifyFormData(this.formPostData).then(res =>{
                                if(res.resultCode == 0){
                                    this.$Message.success('提交成功!');
                                    this.formData.getTabData();
                                    this.formData.addModal=false;
                                    this.formData.handleThemeId='';
                                }else{
                                    this.$Message.error(res.resultMsg);
                                }
                                
                                
                            })
                        }
                    } else {
                        
                    }
                })
            },
            
            handleClose() {
                this.formData.addModal=false;
            },
            checkWords1:function(e){

                // if(this.markDataLength >= 1001 ){
                //     this.guideTipe='导读文章长度不能超过100字';
                // }else if(this.markDataLength ==0 ){
                //     this.guideTipe='请上传导读文章';
                // }else{
                //     this.guideTipe='';
                // }
                this.$refs['formValidate'].validate((valid) => {
                    console.log(valid)
                });
            },
            checkWords:function(e){
                
                // if(this.markedResultDescLength >= 101 ){
                //     this.briefTipe='简介长度不能超过100字';
                // }
                // else if(this.markedResultDescLength ==0 ){
                //     this.briefTipe='请输入简介';
                // }else{
                //     this.briefTipe='';
                // }
                this.$refs['formValidate'].validate((valid) => {
                    console.log(valid)
                });
                
            },
            updateBrief: function(e) {
                this.formValidate.brief = e.target.value;
                this.markedResultDescLength = this.$refs.markedResultDesc.innerText.replace(/[\r\n]/g,"").length;
            },
            updateGuide: function(e) {
                this.formValidate.guide = e.target.value;
                this.markDataLength = this.$refs.markedResult.innerText.replace(/[\r\n]/g,"").length;
               
            }

           
        },
        computed: {
            compiledBriefMarkdown: function () {
                
                return marked(this.formValidate.brief, { sanitize: true })
                 
            },
            compiledGuideMarkdown: function () {
                return marked(this.formValidate.guide, { sanitize: true })
                  
            }
        }
    }
</script>


<style lang="less">

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
    .audio-preview{
            position:relative;
            width:100%;
            padding-right:50px;
            .audio-player{
                display:flex;
                align-items: center;
                width:100%;
                background:#f2f2f2;
            }
            .audio-method{
                position:absolute;
                display:flex;
                justify-content: center;
                align-items: center;
                width:50px;
                top:0;
                right:0;
                bottom:0;
                font-size:24px;
                border:1px solid #f2f2f2;
                cursor:pointer;
                &:hover{
                    background:rgba(0,0,0,.5);
                    color:#fff;
                }
            }
        }
    .audio-cover-preview{
            position:relative;
            display:inline-block;
            width:90px;
            height:90px;
            overflow:hidden;
            img{display:block;width:100%;margin:0 auto;}
            .audio-cover-method{
                display:none;
                position:absolute;
                justify-content: center;
                align-items: center;
                top:0;
                left:0;
                right:0;
                bottom:0;
                background:rgba(0,0,0,.6);
                i{
                    color: #fff;
                    font-size: 30px;
                    cursor: pointer;
                    margin: 0 5px;
                }
            }
            &:hover{
                .audio-cover-method{display:flex;}
            }
        }
    .module-audio-upload{
        height:100%;
        overflow:scroll;
        .module-container-audio{
            width:75%;
            padding-top:25px;
            margin:0 auto;
        }
        .upload-main{
            padding:10px 0;
            font-size:18px;
        }
        .audio-cover-preview{
            position:relative;
            display:inline-block;
            width:90px;
            height:90px;
            overflow:hidden;
            img{display:block;width:100%;margin:0 auto;}
            .audio-cover-method{
                display:none;
                position:absolute;
                justify-content: center;
                align-items: center;
                top:0;
                left:0;
                right:0;
                bottom:0;
                background:rgba(0,0,0,.6);
                i{
                    color: #fff;
                    font-size: 30px;
                    cursor: pointer;
                    margin: 0 5px;
                }
            }
            &:hover{
                .audio-cover-method{display:flex;}
            }
        }
        
    }



    #editor textarea{
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

    #editor textarea:focus {
        outline: 0;
        border-color: #57a3f3;
        box-shadow: 0 0 0 2px rgba(45,140,240,.2);
    }
    #editor div{
        width: 100%;
        max-width: 100%;
        word-wrap:break-word 
    }
    code {
        word-wrap:break-word;
        white-space: normal;
        color: #f66;
    }
</style>