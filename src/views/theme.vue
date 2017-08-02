
<template>
    <div class="layout">
       
          
                <div class="layout-content">
                    <div class="layout-content-main">
                        <h3>主题配置</h3>
                        <div class="layout-interact layout-padding-cls">
                            <Button type="primary" v-on:click="doAdd" style='margin-right:10px'>新建主题</Button>
                            <Button v-on:click="doEdit" style='margin-right:10px'>修改内容</Button>
                            <Button  @click="ifHadCheck('删除');ifPutOn=false;ifPullOff=false;ifRemovef=true;" style='margin-right:10px'>删除</Button>
                            <Button @click="ifHadCheck('下架');ifPullOff=true;ifPutOn=false;ifRemovef=false;" style='float:right;margin-right:20px'> 下架</Button>
                            <Button type="primary" @click="ifHadCheck('上架');ifPutOn=true;ifPullOff=false;ifRemovef=false;" style='float:right;margin-right:20px'>上架</Button>
                         
                        </div>
                        <div class="delete-info-alert" v-show="ifUndoRemove">
                            <Alert type="success" show-icon closable ref="deleteAlert">
                                <div class="delete-alert-desc" slot="desc">
                                    <span class="delete-alert-tip">删除"{{deletName}}"成功！</span>
                                    <Button type="primary" @click="undoRemove">撤销</Button>
                                </div>
                            </Alert>
                        </div>
                        <div class="layout-padding-cls">
                            <Table :columns="columns1" :data="data1" highlight-row @on-row-click='getClickId' ></Table>
                        </div>
                        <div class="layout-padding-cls">
                            <Page 
                                :total="pageTotal"
                                :page-size="rows"
                                :page-size-opts="[10, 20, 30, 40]"
                                show-total
                                show-sizer
                                @on-change="pageChange"
                                @on-page-size-change="pageChangeSize"	
                            ></Page>
                        </div>
                    </div>
                </div>
           
            <Modal v-model="removeModal" maskClosable width="360">
                <p slot="header" style="color:#f60;text-align:center">
                    <Icon type="information-circled"></Icon>
                    <span v-if='ifPutOn' >上架确认</span>
                    <span v-if='ifPullOff'>下架确认</span>
                    <span v-if="ifRemovef">删除确认</span>
                    
                </p>
                <div style="text-align:center">
                    <p v-if='ifPutOn' >你将上架该主题</p>
                    <p v-if='ifPullOff'>你将下架该主题</p>
                    <p v-if="ifRemovef">你将删除该主题</p>
                </div>
                <div slot="footer">
                    <Button type="error" v-if='ifPutOn' size="large" long  @click="putOn">上架</Button>
                    <Button type="error" size="large"  v-if='ifPullOff' long  @click="pullOff">下架</Button>
                    <Button type="error" size="large" long  v-if="ifRemovef" @click="removeTheme">删除</Button>
                </div>
            </Modal>
            
            <Modal
                v-model="formData.addModal"
                maskClosable
                title="新建主题"
                mask-closable=false>
                <addTheme :form-data="formData"></addTheme>
                <div slot="footer">
                </div>
            </Modal> 
            
            <Modal
                v-model="modal2"
                maskClosable
                title="关联子主题">
               <template>
                    <Transfer
                        :data="alreadlySet"
                        :target-keys="targetKeys4"
                        :render-format="render4"
                        :titles="['未添加主题','已配置主题']"
                        filterable
                        @on-change="handleChange4"></Transfer>
                </template>
                <div slot="footer">
                </div>
            </Modal> 
    </div>
   
</template>
<script>

    import AddTheme from './addTheme.vue'
    //import ModifyTheme from '../views/modifyTheme.vue';
    import { getThemeList,getAliyunToken,getInfo,removeTheme,downTheme,upTheme,getChileThemelist,modifyChileThemelist,undoRemoveTheme} from "../libs/api"
    export default {
        data () {
            return {
                themeStatus:'',
                alreadlySet:[ ],
                targetKeys4: ["1","2"],
                modal2: false,
                removeModal:false,
                ifPutOn:false,
                ifPullOff:false,
                ifRemovef:false,
                ifUndoRemove:false,
                ifUndoRemoveId:'',
                removeName:null,
                deletName:null,
                pageTotal:0,
                page_num:1,
                rows:10,
                formData:{
                    handleThemeId:'',
                    ifAdd:true,
                    addModal:false,
                    modifyModal:false,
                    modifyData:{},
                    addData:{},
                    getTabData:this.getTabData
                },
               
                formItem: {
                    name:''
                },
                
                columns1: [
                    {
                        title: '主题名称',
                        key: 'name'
                    },
                    {
                        title: '导读音频',
                        key: 'file_name',
                        render: (h, params) => {
                            let video=!!params.row.uri?params.row.file_name:'暂无音频'
                            
                            return h('div', [
                                h('a', {
                                    attrs:{
                                        href:params.row.uri,
                                        target:'view_window'
                                    }
                                    
                                }, video)
                                ])
                        },
                    },
                    {
                        title: '主题内容',
                        key: 'count',
                        render: (h, params) => {
                           let subject=!!params.row.count?params.row.count:'未配置'
                            return h('div', [
                                h('a', {
                                    attrs: {
                                        type: 'text',
                                        size: 'small'
                                       
                                    },
                                    style:{
                                        color:'#2b85e4'
                                    },
                                    on: {
                                        click: () => {
                                            this.show(params)
                                        }
                                    }
                                }, subject)
                                ])
                        },
                    },
                    {
                        title: '上架状态',
                        key: 'status',
                        render: (h, params) => {
                           let status=!!params.row.status==0?'下架':'上架'
                            return h('div',status)
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
                data1: [
 
                ],
                
            }
        },
        created(){
            this.getTabData();
           
        },
        computed:{
            user(){
                return !!this.$store.state.user ? this.$store.state.user : {username:'',is_staff:false,is_superuser:false}
            }
        },
        components:{AddTheme},
        methods: {

            doAdd (){
                
                this.formData={
                            ifAdd:true,
                            addModal:true,
                            modifyModal:true,
                            addData:{},
                            getTabData:this.getTabData
                }
            },
            doEdit (){
                this.ifAdd=false;
                let id=this.formData.handleThemeId;
                if(!!!id){ 
                    this.$Message.error('请选择要修改的主题')
                    return
                }
                getInfo(id).then(res => {
            
                    if(res.resultCode == 0){
                        this.formData={
                            ifAdd:false,
                            addModal:true,
                            modifyModal:true,
                            handleThemeId:id,
                            addData:{},
                            getTabData:this.getTabData
                        }
                        this.formData.modifyData=res.data;
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                })
                this.formData.addModal=true;
            },
            getClickId(data){ 
              this.formData.handleThemeId=data.id;
              this.themeStatus=data.status;
              this.removeName=data.name;
              console.log(data.status)
            },
            putOn(){ //主题上架
               
                let id=this.formData.handleThemeId;
               
                upTheme(id).then(res => {
                    if(res.resultCode == 0){
                        this.$Message.success('上架成功');
                        this.removeModal=false;
                        this.getTabData();
                        this.formData.handleThemeId='';
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                })
            
            },
            pullOff(){//主题下架
                
                let id=this.formData.handleThemeId;
               
                downTheme(id).then(res => {
                    if(res.resultCode == 0){
                       this.removeModal=false;
                       this.$Message.success('下架成功');
                        this.getTabData();
                         this.formData.handleThemeId='';
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                })
                
                
            },
            removeTheme(){//删除主题
                 let id=this.formData.handleThemeId;
                
                removeTheme(id).then(res => {
                    if(res.resultCode == 0){
                       this.removeModal=false;
                        this.$Message.success('删除成功');
                        this.getTabData();
                        this.ifUndoRemove=true;
                         this.ifUndoRemoveId=id;
                         this.deletName=this.removeName;
                         this.handleThemeId='';
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                })
            },
            undoRemove(){
                let id=this.ifUndoRemoveId;
                undoRemoveTheme(id).then(res=>{
                    if(res.resultCode == 0){
                       this.removeModal=false;
                        this.$Message.success('撤销成功');
                         this.getTabData();
                         this.ifUndoRemove=false;
                         this.ifUndoRemoveId='';
                         this.formData.handleThemeId='';
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                })
            },
            pageChange(num){
                this.page_num=num;
                this.getTabData();
            },
            pageChangeSize(row){
                this.rows=row;
                this.getTabData();
            },
            ifHadCheck(e){
                 let id=this.formData.handleThemeId;
                 if(this.ifUndoRemoveId==''&&e=='撤销'){
                    this.$Message.error('没有需要撤销的删除操作');
                    return
                }
                if(!!!id){ this.$Message.error('请先选择一个主题'); return}
                if(this.themeStatus==0&&e=='下架'){
                    this.$Message.error('该主题已经下架了');
                  
                    return
                }
                if(this.themeStatus==1&&e=='上架'){
                    this.$Message.error('该主题已经上架了');
                   
                    return
                }
                
                this.removeModal=true;
            },
            show(val){
                let id=val.row.id;
                if (!!!id){return}
                getChileThemelist(id).then(res =>{
                    if(res.resultCode == 0){
                       
                        let leftList=[],rightList=[];
                        res.data.can_set.forEach(function(o,i){
                            leftList.push({
                                key:o.id,
                                label:o.name,
                                disabled:false
                            });
                        })
                        res.data.already_set.forEach(function(o,i){
                            rightList.push(o.id);
                            leftList.push({
                                key:o.id,
                                label:o.name,
                                disabled:false
                            });
                        })
                         console.log(rightList)
                        this.targetKeys4=rightList;
                        this.alreadlySet=leftList;
                        this.modal2=true;
                    }else{
                        this.$Message.error(res.resultMsg);
                    }
                })
               

            },
            getTabData(){
                let pageName=this.page_num,_rows=this.rows;
                getThemeList(pageName,_rows).then(res => {
                    
                    if(res.resultCode == 0){
                        this.pageTotal=res.data.count;
                        this.data1 = res.data.list;
                        this.themeStatus="";
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                 })
            },
            getTargetKeys () {
                
            },
            handleChange4 (newTargetKeys) {
                let id=this.formData.handleThemeId;
                let resIds=newTargetKeys;
                modifyChileThemelist(id,resIds).then(res => {
                    if(res.resultCode == 0){
                        this.targetKeys4 = newTargetKeys;
                        this.getTabData();
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                })
            },
            render4 (item) {
                return item.label;
            }
            
        }
    }
</script>

<style scoped>
    .layout-padding-cls{
        padding: 15px 0;
    }
    .layout-content{
        min-height: 200px;
        margin: 15px;
        padding-bottom:100px;
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
</style>