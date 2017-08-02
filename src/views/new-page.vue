
<template>
    <div class="layout">
       
          
                <div class="layout-content">
                    <div class="layout-content-main">
                        <h3>智能推荐配置：</h3>
                            <div class="layout-padding-cls">
                                <Table :columns="columns2" :data="data2"   ></Table>
                            </div>
                        <h3>主题配置</h3>
                        <div class="layout-interact layout-padding-cls">
                        <label style='margin-right:10px'>前端排序：</label>
                        <template >
                            <Select :value="selectInput1[0].value"   style="width:120px" @on-change="selectChange1">
                                <Option  v-for="item in selectInput1" :value="item.value" :key="item.value">{{ item.label }}</Option>
                            </Select>
                        </template>
                         <label style='margin:0 10px'>批量排序：</label>
                        <template>
                            <Select :value="selectInput[0].value"   style="width:120px" @on-change="selectChange">
                                <Option  v-for="item in selectInput" :value="item.value" :key="item.value">{{ item.label }}</Option>
                            </Select>
                        </template>
                       
                         <Button type="primary" v-on:click="doAdd" style='float:right; margin-right:10px'>新建主题</Button>
                        
                        </div>
    
                        <div class="layout-padding-cls">
                            <Table :columns="columns1" :data="data1" disabled-hover  class='table' custom @on-sort-change='sortChange'></Table>
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
            <Modal
                v-model="addModal"
                maskClosable
                title="添加模块">
                     <Form :rules="ruleValidate" :model="formValidate" :label-width="80" ref='formValidate'>
                        <Form-item label="模块名称" prop='name'>
                            <Input v-model="formValidate.name" placeholder="建议10个字以内" ></Input>
                        </Form-item>
                        <Form-item style='margin-bottom:0px;'>
                            <div style='text-align:right;'>
                                <Button type="primary" @click="handleSubmit('formValidate')" >提交</Button>
                                <Button type="ghost" @click="handleClose()" style="margin-left: 8px">取消</Button>
                            </div>
                        </Form-item>
                    </Form>
                <div slot="footer">
                </div>
            </Modal> 
            <Modal
                v-model="modal2"
                maskClosable
                title="配置模块"
                @on-ok="ok1"
                >
               <template>
                    <Transfer
                        class='transfer1'
                        :data="alreadlySet1"
                        :target-keys="targetKeys1"
                        :render-format="render1"
                        :titles="['未添加主题','已配置主题']"
                        filterable
                        :filter-method="formatSeach"
                        @on-change="handleChange1"
                       
                        ></Transfer>
                </template>
            </Modal> 
            <Modal
                v-model="modal3"
                maskClosable
                title="关联子主题"
                 @on-ok="ok"
                >
               <template>
                    <Transfer
                        class='transfer'
                        :data="alreadlySet"
                        :target-keys="targetKeys"
                        :render-format="render"
                        :titles="['未添加主题','已配置主题']"
                        filterable
                        :filter-method="formatSeach"
                        @on-change="handleChange"></Transfer>
                </template>
               
            </Modal> 

            <Modal
                v-model="deleteModal1"
                title="删除确认"
                :loading="loading"
                @on-ok="removeModal">
                <p>确认要删除该模块？</p>
            </Modal>
    </div>
   
</template>
<script>
//import Sortable from 'vue-sortable'
    import Sortable from 'sortablejs'
    import { getModalConfigList,addModalConfig,getModalList,changeStatusOpen,deleteModal,getTransferList,modifyTransferList,getTransferList1,modifyTransferList1,editModal,selectModal,selectStatus,modalListSort} from "../libs/api"
    export default {
 
        data () {
            return {
                doSeqEditInput:null,
                doSeqOldVal:'',
                doNameEditInput:null,
                doNameOldVal:'',
                handleModalId:'',
                themeStatus:'',
                deleteId:'',
                deleteModal1:false,
                alreadlySet1:[ ],
                alreadlySet:[],
                targetKeys1: [],
                targetKeys: [],
                modal2: false,
                modal3:false,
                addModal:false,
                isTableSort:false,
                loading: true,
                newList:[],
                olderList:[],
                newList1:[],
                olderList1:[],
                pageTotal:0,
                page_num:1,
                rows:50,
                selectInput1:[
                    {value:'0',label:'从小到大'},
                    {value:'1',label:'从大到小'}
                ],
                selectInput:[
                    {value:'create',label:'按创建时间排序'},
                    {value:'modify',label:'按修改时间排序'},
                    {value:'name',label:'按名称排序'}
                ],
                formValidate:{
                    name:''
                },
               
                formItem: {
                    name:''
                },
                columns2:[
                    {
                        title:'时间点',
                        key:'interval_name'
                    },
                    {
                        title:'配置',
                        key:'series_count',
                        render:(h,params)=>{
                            return h('div',{
                                        attrs:{
                                            class:'configCls'
                                        }
                                    },[
                                    h('span',params.row.series_count),
                                    h('Button',{
                                        props:{
                                            type:'primary',
                                            size:'small',
                                            shape:'circle'
                                        },
                                        on:{
                                            click:()=>{
                                                this.show(params.row.id)
                                            }
                                        }
                                    },'配置')
                                
                            ])
                        }
                    }
                ],
                columns1: [
                    {
                        title: '模块名称',
                        key: 'name',
                        render:(h,params)=>{
                            return h('div',{
                                attrs:{
                                    class:'nameInput',
                                },
                                on:{
                                    dblclick:(evt)=>{
                                       
                                        if(!!this.doSeqEditInput&&this.doSeqEditInput.disabled==false){
                                            this.doSeqEditInput.focus();
                                            this.$Message.error('请先保存上一条数据')
                                            return
                                        }
                                        if(!!this.doNameEditInput&&this.doNameEditInput.disabled==false){
                                            this.doNameEditInput.focus();
                                            this.$Message.error('请先保存上一条数据')
                                            return
                                        }
                                        this.doNameEditInput=evt.toElement;
                                        this.doNameOldVal=this.doNameEditInput.value;
                                       evt.toElement.disabled=!evt.toElement.disabled
                                       this.doNameEditInput.focus();	
                                    }
                                }
                            },[
                                    h('Input',{
                                        attrs:{
                                            type:'text',
                                            value:params.row.name,
                                            disabled:true,
                                            maxlength:50
                                        },
                                        on:{
                                            // 'on-blur':()=>{
                                            //     console.log('on-blur',this.doNameEditInput.value)
                                            //     this.doEditName(params.row,this.doNameEditInput.value);
                                                
                                            // },
                                            'on-enter':()=>{
                                                 this.doEditName(params.row,this.doNameEditInput.value);
                                            },
                                            'on-keydown':(event)=>{

                                                 if(event.key=='Escape'){
                                                     this.doNameEditInput.value=this.doNameOldVal;
                                                     this.doNameEditInput.disabled=true;
                                                 }
                                            }

                                        }
                                    })
                                ])
                        }
                    },
                    {
                        title: '排序',
                        key: 'seq_no',
                        render:(h,params)=>{
                            return h('div',{
                                attrs:{
                                    class:'seqInput',
                                },
                                on:{
                                    dblclick:(evt)=>{
                                        if(!!this.doNameEditInput&&this.doNameEditInput.disabled==false){
                                            this.doNameEditInput.focus();
                                            this.$Message.error('请先保存上一条数据')
                                            return
                                        }
                                        if(!!this.doSeqEditInput&&this.doSeqEditInput.disabled==false){
                                            this.doSeqEditInput.focus();
                                            this.$Message.error('请先保存上一条数据')
                                            return
                                        }
                                        this.doSeqEditInput=evt.toElement;
                                        this.doSeqOldVal=this.doSeqEditInput.value;
                                        if(evt.toElement.disabled==false){
                                            
                                            let myRe = /^(0|[1-9][0-9]*)$/;
                                            if(myRe.test(this.doSeqEditInput.value)) {
                                                evt.toElement.disabled=!evt.toElement.disabled
                                                
                                            }else{
                                                 
                                            }
                                        }else{
                                            evt.toElement.disabled=!evt.toElement.disabled
                                        }
                                        
                                       this.doSeqEditInput.focus();	
                                    }
                                }
                            },[
                                    h('Input',{
                                        attrs:{
                                            type:'text',
                                            value:params.row.seq_no,
                                           
                                            disabled:true
                                        },
                                        on:{
                                            
                                            'on-enter':()=>{
                                                 this.doEditSeq(params.row,this.doSeqEditInput.value);
                                            },
                                            'on-keydown':(event)=>{

                                                 if(event.key=='Escape'){
                                                     console.log(event.key)
                                                     console.log(this.doSeqEditInput)
                                                     this.doSeqEditInput.value=this.doSeqOldVal;
                                                     this.doSeqEditInput.disabled=true;
                                                 }
                                            }

                                        }
                                        
                                        
                                    })
                                ])
                        }
                        
                    },
                    {
                        title: '配置',
                        key: 'series_count',
                        render:(h,params)=>{
                            return h('div',{
                                        attrs:{
                                            class:'configCls'
                                        }
                                    },[
                                    h('span',params.row.series_count),
                                    h('Button',{
                                        props:{
                                            type:'primary',
                                            size:'small',
                                            shape:'circle'
                                        },
                                        on:{
                                            click:()=>{
                                                console.log(params.row.tag_id)
                                               this.show1(params.row.tag_id)
                                            }
                                        }
                                    },'配置')
                                ]);
                        }
                    },
                    {
                        title: '上架状态',
                        key: 'abandon_flag',//0是开启 1是关闭
                         render:(h,params)=>{
                            return h('i-switch',{
                                props:{
                                    size:'large',
                                    value:(params.row.abandon_flag=='0') ? true : false
                                },
                                on:{
                                    input:(status)=>{
                                        this.changeStatus(params.row.tag_id,status?'on':'off');
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
                    },
                    {
                        title: '创建时间',
                        key: 'create_time',
                        sortable: true
                    },
                    {
                        title: '修改时间',
                        key: 'modify_time',
                        sortable: true,
                       
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 150,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                               
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.deleteModal1=true;
                                            this.deleteId=params.row.tag_id
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
               
                data1:[

                ],
                data2:[
                   
                ],
                ruleValidate: {
                    name: [
                        { required: true, message: '名称不能为空', trigger: 'blur' },
                        { max: 20, message: '名称长度不能超过20', trigger: 'blur'}
                    ]
                }
                
            }
        },
        created(){
           this.getListData();
           this.getModalListData();
           
        },
        computed:{
            user(){
                return !!this.$store.state.user ? this.$store.state.user : {username:'',is_staff:false,is_superuser:false}
            }
        },
       
        methods: {
            sortChange(evt){
        
                let sort='';
                if(evt.order=='asc'){
                    sort=''
                }else{
                    sort='-'
                }

                modalListSort(evt.key,sort,this.page_num,this.rows).then(res=>{
                    if(res.resultCode == 0){
                        this.pageTotal=res.data.count;
                    
                    this.data1=res.data.list
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                })
                           
            },
            doAdd(){
                this.addModal=true;
            },
            doEditName(row,val){
                if(val==''){
                    this.doNameEditInput.focus();
                    this.$Message.error('模块名字不能为空')
                    return
                };
               editModal(row.tag_id,val,row.seq_no).then(res=>{
                    this.getModalListData();
                    this.doNameEditInput=null;
                })
            },
            doEditSeq(row,val){
                let myRe = /^[0-9]*$/;
                if(val==''){
                    this.doSeqEditInput.focus();
                    this.$Message.error('序号不能为空')
                    return
                };
                if(myRe.test(val)) {
                     editModal(row.tag_id,row.name,val).then(res=>{
                        this.getModalListData();
                        this.doSeqEditInput.disabled=true;
                        this.doSeqEditInput=null;
                    })
                }else{
                  
                    this.$Message.error('序号只能输入数字')
                    this.doSeqEditInput.focus();
                }
                
              
            },
            doSort(){
              
                
            },

            setSort1() {
                const el = document.querySelectorAll('.ivu-transfer-list-content')[1];
                    this.sortable1 = Sortable.create(el, {
                        onEnd: evt => {
                            let  newIndex=[].concat(this.targetKeys1)
                            const tempIndex = newIndex.splice(evt.oldIndex, 1)[0];
                            newIndex.splice(evt.newIndex, 0, tempIndex);
                            this.$nextTick(() => {
                                this.newList1=newIndex
                                console.log(this.newList1)
                            })
                           
                           
                        }
                    })

            },
            
            getListData(){
                return getModalConfigList().then(res=>{
                    console.log(res)
                    this.data2=res.data.list
                })
            },
            getModalListData(){
                let pageName=this.page_num,_rows=this.rows;
                 getModalList(pageName,_rows).then(res => {
                    
                    if(res.resultCode == 0){
                        this.pageTotal=res.data.count;
                       
                       this.data1=res.data.list
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                 })

            },
            changeStatus(id,status){
                let _status=status=='on'?0:1
                changeStatusOpen(id,_status).then(res=>{
                    this.getModalListData();
                })
            },
            removeModal(){
                deleteModal(this.deleteId).then(res=>{
                    this.getModalListData();
                    this.deleteModal1=false;
                    this.loading=false;
                })
            },

            selectChange(value){
                console.log(value)
                selectModal(value).then(res=>{
                    this.getModalListData();
                })
            },
            selectChange1(value){
                selectStatus(value).then(res=>{
                    if(res.resultCode == 0){
                        this.$Message.success('操作成功');
                    }else{
                        this.$Message.error(res.resultMsg);
                    }
                   
                })
            },
            pageChange(num){
                this.page_num=num;
                this.getModalListData();
            },
            pageChangeSize(row){
                this.rows=row;
                this.getModalListData();
            },
            show(id){
                this.handleModalId=id;
                getTransferList(id).then(res =>{
                    if(res.resultCode == 0){
                       console.log(res.data.already_set_result)
                        let leftList=[],rightList=[];
                        res.data.all_set_result.list.forEach(function(o,i){
                            leftList.push({
                                key:o.id,
                                label:o.name,
                                disabled:false
                            });
                        })
                        res.data.already_set_result.list.forEach(function(o,i){
                            rightList.push(o.id);
                        })
                        this.targetKeys=rightList;
                        this.alreadlySet=leftList;
                        this.modal3=true;
                        
                        
                    }else{
                        this.$Message.error(res.resultMsg);
                    }
                })
            
            },
            show1(id){
                this.handleModalId=id;
                getTransferList1(id).then(res =>{
                    if(res.resultCode == 0){
                       console.log(res.data.already_set_result)
                        let leftList=[],rightList=[],arry=[];
                        res.data.all_set_result.list.forEach(function(o,i){
                            leftList.push({
                                key:o.id,
                                label:o.name,
                                disabled:false
                            });
                            arry.push(o.id)
                        })
                        res.data.already_set_result.list.forEach(function(o,i){
                            rightList.push(o.id);
                        })
                        this.targetKeys1=rightList;
                        this.alreadlySet1=leftList;
                        this.newList1=this.targetKeys1;
                        this.modal2=true;
                        
                        this.setSort1();
                    }else{
                        this.$Message.error(res.resultMsg);
                    }
                })
            
            },           
            handleChange(newTargetKeys) {
               
                  this.targetKeys = newTargetKeys;
                  
            },
            handleChange1(newTargetKeys) {
                 let id=this.handleModalId;
                  this.newList1 = newTargetKeys;
                 this.targetKeys1 = newTargetKeys;
                 console.log('newTargetKeys',   this.targetKeys1)
                 this.$nextTick(() => {
                   
                    this.setSort1();
                })
                
                
            },
            formatSeach(data,query){
                let arry=[];
                arry= query.split(",")
                let ss=false;
                if(query!=''){
                    arry.forEach(function(o,i){
                        if(o==''){
                            arry.splice(i, 1)
                            return
                        }
                        if(data.label.indexOf(o) > -1){
                            return ss=true;
                        }
                    })
                    if(ss){
                        return data.label
                    }
                }else{
                    return data.label
                }                 
            },
            render(item) {
                return item.label;
            },
            render1 (item) {
               // return item.key+'-'+item.label;
               return item.label;
            },
            ok(){
                console.log(this.newList);
                modifyTransferList(this.handleModalId,this.targetKeys).then(res => {
                    if(res.resultCode == 0){
                        this.getListData();
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                })
            },
           
            ok1(){//模块配置穿梭框数据修改
                modifyTransferList1(this.handleModalId,this.newList1).then(res => {
                    if(res.resultCode == 0){
                        this.getModalListData();
                    }else{
                        this.$Message.error(res.resultMsg)
                    }
                })
            },
           

            handleSubmit(form){
                this.$refs[form].validate((valid) => {
                    if (valid) {
                        addModalConfig(this.formValidate).then(res=>{
                            this.getModalListData();
                            this.addModal=false;
                        })
                    }
                })
            },
            handleClose() {
                this.addModal=false;
            }
            
        }
    }
</script>

<style >
    .seqInput .ivu-input[disabled],.nameInput .ivu-input[disabled] {
            background-color:#fff;
            border:none;
            cursor:default;
            color:#495060;
    }
    .seqInput .ivu-input[disabled]:hover,.nameInput .ivu-input[disabled]:hover{
          /*background-color:#ebf7ff*/
        }
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

    .button-activity{
        background:green
    }
         .configCls button{
        margin-left:10px;
    }

</style>