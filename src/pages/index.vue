<style lang="less" scoped>
    .app-main-container{
        min-height: 900px;
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
    .app-footer{
        text-align: center;
        padding: 10px 0 20px;
        color: #9ea7b4;
    }
    .layout-menu-left{
        background: #464c5b;
        .ivu-menu-vertical .ivu-menu-item, .ivu-menu-vertical .ivu-menu-submenu-title{
            padding: 0;
        }
        a{
            color:#657180;
            &.router-link-active{
                color:#fff
            }
            &:hover{
                color: #fff;
            }
        }
        .menu-text{
            display: block;
            padding: 14px 0;
            text-align: center;
        }
        &:after{
            content: "";
            display: block;
            width: 1px;
            height: 100%;
            background: #d7dde4;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            z-index: 1;
        }
    }
    .app-header{
        height: 60px;
        line-height: 60px;
        text-align: right;
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
<template>
    <div class="app-main-container">
        <Row type="flex" class-name="app-main-content">
            <i-col span="3" class="layout-menu-left">
                <div class="layout-logo-left"></div>
                <Menu active-name="1" theme="dark" width="auto" :open-names="['1']">
                    <Menu-item name="1"><router-link to="/theme" class="menu-text">主题配置</router-link></Menu-item>
                    <Menu-item name="2"><router-link to="/sub-theme" class="menu-text">子主题配置</router-link></Menu-item>
                    <Menu-item name="3"><router-link to="/new-page" class="menu-text">模块配置</router-link></Menu-item>
                    <Menu-item name="4"><router-link to="/album" class="menu-text">专辑配置</router-link></Menu-item>
                    <Menu-item name="5"><router-link to="/audio-list" class="menu-text">音频配置</router-link></Menu-item>
                </Menu>
            </i-col>
            <i-col span="21">
                <div class="app-header">
                    <span>欢迎回来：{{user.username}}</span>
                    <Button type="text" @click="logout">退出登录</Button>
                </div>
                <div class="app-content">
                    <router-view></router-view>
                </div>
                <div class="app-footer">
                    星宝乐园
                </div>
            </i-col>
        </Row>
    </div>
</template>
<script>
    import {checkLogin} from '../libs/api'
    import { mapActions } from 'vuex'

    export default {
        beforeRouteEnter: (to, from, next) => {
            next(vm => {
                if(vm.$store.state.user) return vm.$router.replace('/theme');
                return vm.$router.replace('/login');
            })
        },
        data(){
            return {}
        },
        computed:{
            user(){
                return !!this.$store.state.user ? this.$store.state.user : {username:'',is_staff:false,is_superuser:false}
            }
        },
        methods:{
            logout(){
                this.$store.dispatch('logout').then(() => {
                    this.$router.replace('/login')
                })
            }
        }
    }
</script>