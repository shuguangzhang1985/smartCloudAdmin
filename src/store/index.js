import Actions from './actions'
import Mutations from './mutations'

import HeaderNav from './modules/header-nav'

export default {
    state: {
        user:null
    },
    getters:{
        authorizd: state => !!state.user
    },
    mutations: Mutations,
    actions: Actions,
    modules: {
        headernav:HeaderNav
    }
}