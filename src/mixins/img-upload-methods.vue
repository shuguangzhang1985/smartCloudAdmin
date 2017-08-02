<script>
    import uuidV4 from 'uuid/v4'
    export default {
        data(){
            return {
                img:{
                    cover:{
                        status:"",
                        url:"",
                        name:'',
                        filename:'',
                        percentage:0
                    },
                    bg_img:{
                        status:'',
                        url:'',
                        name:'',
                        filename:"",
                        percentage:0
                    },
                    options:null,
                    query:{},
                    format:['jpg','jpeg','png'],
                    action:'http://xb-3sc.oss-cn-hangzhou.aliyuncs.com',
                    viewHost:'http://xb-3sc.xingbook.com/xb-3sc/',
                    viewImg:'',
                    visible:false

                }
            }
        },
        methods:{
            beforeCoverUpload(file){
                let currentFormat = this.formatCheck(file);
                
                if(!currentFormat){
                    this.$Message.error('请选择正确的图片格式文件!');
                    return false;
                }
                 console.log(typeof this.img.options != 'object')
                if(typeof this.img.options != 'object'){
                   
                    this.$Message.error('配置信息还未生成，请稍后!');
                    return false;
                }

                let filename = this.createFilename(file);
                this.img.cover.filename = filename;

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
            beforeBgImgUpload(file){
                let currentFormat = this.formatCheck(file);
                
                if(!currentFormat){
                    this.$Message.error('请选择正确的图片格式文件!');
                    return false;
                }
                 console.log(typeof this.img.options != 'object')
                if(typeof this.img.options != 'object'){
                   
                    this.$Message.error('配置信息还未生成，请稍后!');
                    return false;
                }

                let filename = this.createFilename(file);
                this.img.bg_img.filename = filename;

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
            
            onMaxSize(file){
                this.$Message.error('超出文件大小限制,文件 ' + file.name + ' 太大，不能超过 2M。');
            },
            onBgImgProgress(e,file,filelist){
                this.img.bg_img = Object.assign(this.img.bg_img,file);
            },
            onBgImgSuccess(response, file, fileList){
                file.name = this.img.bg_img.filename;
                this.img.bg_img = file;

                this.formPostData.bg_img =this.img.viewHost +file.name;
                this.formValidate.bg_img =this.img.viewHost +file.name;
                
            },
            onCoverProgress(e,file,filelist){
                console.log(' percentage1:' +this.img.cover.percentage)
                this.img.cover = Object.assign(this.img.cover,file);
                 console.log(' percentage2:' +this.img.cover.percentage)
            },
            onCoverSuccess(response, file, fileList){
                file.name = this.img.cover.filename;
                this.img.cover = file;

                this.formPostData.audio_file.cover =this.img.viewHost +file.name;
                this.formValidate.cover=this.img.viewHost +file.name;
                
            },
            
            onImgError(error, file, fileList){
                console.log('error:');
                console.log(error);
            },
            handleRemoveCover(){
                this.img.cover = {
                    status:'',
                    url:'',
                    name:'',
                    filename:''
                }
                this.formValidate.cover='';
                this.formPostData.audio_file.cover='';
            },
            handleRemoveBgImg(){
                this.img.bg_img = {
                    status:'',
                    url:'',
                    name:'',
                    filename:''
                }

                this.formValidate.bg_img='';
                this.formPostData.bg_img ='';
            },
            formatCheck(file){
                let name = file.name.split('.');
                let type = name[name.length - 1];
                let currentFormat = false;
                this.img.format.forEach(item => {
                    if(item == type){
                        return currentFormat = true
                    }
                });

                return currentFormat;
            },
            createFilename(file){
                let uuid = uuidV4();
                let name = file.name.split('.');
                let type = name[name.length - 1];
                return uuid + '.' + type;
            }
        },
    }
</script>