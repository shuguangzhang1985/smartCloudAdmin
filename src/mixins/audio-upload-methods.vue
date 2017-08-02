<script>
    import uuidV4 from 'uuid/v4'
    export default {
        data(){
            return {
                audio:{
                    query:{},
                    format:['mp3'],
                    action:'http://xb-vod.oss-cn-hangzhou.aliyuncs.com',
                    options:null,
                    file:{
                        filename:"",
                        duration:0,
                        name:"",
                        percentage:0,
                        response:"",
                        showProgress:true,
                        size:'',
                        status:"finished",
                        uid:''
                    },
                    viewHost:'http://xb-vod.oss-cn-hangzhou.aliyuncs.com/audio/'
                }
            }
        },
        methods:{
            beforeAudioUpload(file){
                let currentFormat = false;

                let uuid = uuidV4();
                console.log(uuid);

                let name = file.name.split('.');
                let type = name[name.length - 1];

                this.audio.format.forEach(item => {
                    if(item == type){
                        return currentFormat = true
                    }
                });
                
                if(!currentFormat){
                    this.$Message.error('请选择正确的音频格式文件!');
                    return false;
                }

                if(typeof this.audio.options != 'object'){
                    this.$Message.error('配置信息还未生成，请稍后!');
                    return false;
                };

                let filename = uuid + '.' + type;
                this.audio.file.filename = filename;

                this.audio.query = {
                    "OSSAccessKeyId":this.audio.options.accessid,
                    "policy":this.audio.options.policy,
                    "Signature":this.audio.options.signature,
                    "success_action_status":'200',
                    "key":this.audio.options.dir + filename
                }
                return new Promise( (resolve,reject) => {
                   this.audio.file.showProgress=true;
                    setTimeout(() => {
                        resolve()
                    },100)
                 })
            },
            onAudioProgress(e,file,filelist){
                this.audio.file = Object.assign(this.audio.file,file);
            },
            onAudioSuccess(response, file, fileList){
                this.ready = false;
                this.audio.file = Object.assign(this.audio.file,file);
                this.audio.query = {};
                this.formPostData.audio_file.file_name=this.audio.file.name;
                this.formPostData.audio_file.size=this.audio.file.size;
                this.formPostData.audio_file.uri=this.audio.viewHost +this.audio.file.filename;
                this.formValidate.uri=this.audio.viewHost +this.audio.file.filename;
                this.$refs['formValidate'].validate((valid) => {
                    console.log(valid)
                });
            },
            onAudioError(error, file, fileList){
                console.log('error:');
                console.log(error);
            },
            handleRemoveAudio(){
                this.audio.file={
                        filename:'',
                        name:'',
                        response:"",
                        percentage:0,
                        showProgress:true,
                        status:"200"
                    }
                  this.formPostData.audio_file.uri='';
                    this.formValidate.uri='';
            }
        },
    }
</script>