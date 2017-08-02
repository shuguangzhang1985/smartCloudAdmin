import Login from './pages/login'
import Index from './pages/Index'
import Views from './views'


const routers = [
    {
        path: '/',
        meta: {
            title: '',
            auth:true
        },
        component: Index,
        children:[
            {
                path:'theme',
                component:Views.Theme
            },
            {
                path:'sub-theme',
                component:Views.SubTheme
            },
            {
                path:'new-page',
                component:Views.NewPage
            },
            {
                path:'album',
                component:Views.Album
            },
            {
                path:'audio-list',
                component:Views.AudioList
            }
        ]
    },
    {
        path:'/login',
        meta: {
            title: '登录',
            auth:false
        },
        component: Login
    }
];
export default routers;