import {postLogout,checkLogin} from '../libs/api'

export default {
    checkLogin({commit}){
        checkLogin().then(res => {
            commit({
                type:'setLoginState',
                state:true,
                info:res.data
            })
        })
    },
    logout({commit}){
        return new Promise((resolve, reject) => {
            postLogout().then(res => {
                commit({
                    type:'setLoginState',
                    user:null
                })

                resolve()
            })
        })
    }
}