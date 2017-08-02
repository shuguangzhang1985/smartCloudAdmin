export default {
    setLoginState(state,payload){
        console.log('set login state');
        return state.user = payload.user;
    }
}