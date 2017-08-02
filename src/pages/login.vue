<template>
    <div class="page-login layout">
        <div class="login-main">
            <div class="logo">logo</div>
            <div class="form">
                <Form ref="formValidate" :model="formValidate" :rules="ruleInline">
                    <Form-item prop="user">
                        <Input type="text" v-model="formValidate.user" placeholder="Username" @on-enter="handleLogin">
                            <Icon type="ios-person" slot="prepend"></Icon>
                        </Input>
                    </Form-item>
                    <Form-item prop="password">
                        <Input type="password" v-model="formValidate.password" placeholder="Password" @on-enter="handleLogin">
                            <Icon type="ios-locked" slot="prepend"></Icon>
                        </Input>
                    </Form-item>
                    <Form-item>
                        <Button type="primary" @click="handleLogin">登录</Button>
                        <Button type="ghost" @click="handleRegister" style="float:right">注册</Button>
                    </Form-item>
                </Form>
            </div>
        </div>
    </div>
</template>
<script>
    import {postLogin} from '../libs/api'
    
    export default {
        beforeRouteEnter: (to, from, next) => {
            next(vm => {
                //校验是否登录
                if(vm.$store.state.login) return vm.$router.replace({path:'/'});
            })
        },
        data(){
            return {
                formValidate: {
                    user: '',
                    password: ''
                },
                ruleInline: {
                    user: [
                        { required: true, message: '请填写用户名', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请填写密码', trigger: 'blur' },
                        { type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
                    ]
                }
            }
        },
        mounted(){
            let h = window.innerHeight;
            this.pageHeight = h > 400 ? h - 400 : h;
        },
        methods:{
            handleLogin() {
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        postLogin(this.formValidate.user,this.formValidate.password).then(res =>{
                            if(res.resultCode == 0 || res.resultCode == 98){
                                this.$Message.success('登录成功!');
                                this.$store.commit({
                                    type:'setLoginState',
                                    user:res.data
                                })
                                this.$refs['formValidate'].resetFields();
                                this.$router.replace({path:'/'})
                            }else{
                                this.$Message.error(res.resultMsg);
                            }
                        });
                    } else {
                        this.$Message.error('表单验证失败!');
                    }
                })
            },
            handleRegister(){
                this.$Message.error('注册暂未开放!');
            }
        }
    }
</script>
<style lang="less">
    .page-login{
        position:fixed;
        top:0;
        left:0;
        right:0;
        bottom:0;
        background:#55c9c4;
        .login-main{
            width:100%;
            height:100%;
            display:flex;
            flex-flow:row nowrap;
            align-items:center;
            justify-content:center;
            .logo{
                width:15rem;
                height:250px;
                line-height:250px;
                text-align:center;
                font-size:50px;
                background:#fff;
            }
            .form{
                display:flex;
                align-items:center;
                justify-content:center;
                width:25rem;
                height:250px;
                background:#f2f2f2;
            }
        }
    }
</style>