import Vue from 'vue';
import iView from 'iview';
import VueRouter from 'vue-router';
import Routers from './router';
import Vuex from 'vuex';
import Util from './libs/util';
import {getJson} from './libs/fetchUtil'
import App from './app.vue';
import 'iview/dist/styles/iview.css';

import StoreObj from './store'
import {checkLogin} from './libs/api'


Vue.use(VueRouter);
Vue.use(Vuex);

Vue.use(iView);


// 路由配置
const RouterConfig = {
    //base:'/theme/',
    mode: 'history',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

const store = new Vuex.Store(StoreObj);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);

    if(to.matched.some(m => m.meta.auth)){
        if(!!store.state.user){
            next();
        }else{
            checkLogin().then(res => {
                if(res.resultCode == 98){
                    store.commit({
                        type:'setLoginState',
                        user:res.data
                    });
                    next('/theme');
                }else{
                    next('/login')
                }
            })
        }
    }else{
        next()
    }

});

router.afterEach(() => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App)
});