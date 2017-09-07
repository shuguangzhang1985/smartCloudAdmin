# smartCloudAdmin
管理后台（技术栈 vue + iview + webpack）


vue 记录笔记
1. vue组件的特点是可插拔、独立作用域、观察者模式、完整的生命周期
2. 一个组件基本跟一个vue实例是类似的，也有自己的methods和data
3. props是从父级通过html特性传递来的数据，它可以是字符串、数字、布尔、数组、对象，默认是单向的，也可以设置为双向绑定的。props里的参数可以直接通过像this.msg这种方式调用，这与data的里的数据是一样的。
4. 多个相同子组件, 父子组件间的通信,通过$refs就可以给指定的组件触发事件.事实上，通过$refs是可以获取到子组件的整个实例的。
5. 多个相同子组件中通过在父组件引用子组件的html上通过绑定自定义时间来触发自定义时间，比如：

```javascript

  <child :msg="msg1" v-ref:child1 @child-event="handler1"></child>
  <child :msg.sync="msg2" v-ref:child2 @child-event="handler2"></child>

  new Vue({
      data: {
          msg1: 'Hello，TalkingCoder',
          msg2: '你好，TalkingCoder'
      },
      methods: {
          sendData: function() {
              this.$refs.child1.$emit('set-data', {});
              this.$refs.child2.$emit('set-data', {});
          },
          handler1: function() {
              // ...
          },
          handler2: function() {
              // ...
          }
      }
  })
  
  ```
  6. Vue.js 组件 API 来自三部分——prop，事件和 slot：
    1. prop 允许外部环境传递数据给组件；
    2. 事件 允许组件触发外部环境的 action；
    3. slot 允许外部环境插入内容到组件的视图结构内。
    
 7. vue-router还有一些钩子函数，通俗讲就是在发生一次路由时某个状态的一些回调。我们的项目main.js中使用了：
 ```javascript
   router.beforeEach(function () {
      window.scrollTo(0, 0);
  });

  router.afterEach(function (transition) {
      console.log(transition);
  });
   ```
    1. beforeEach()是在路由切换开始时调用，这里我们将页面返回了顶端。

    2. afterEach()是在路由成功切换到激活状态时调用，可以打印出transition看看里面都有什么。一般在这里可以做像自动导航、自动面包屑的一些全局工作。

    3. router.redirect()很简单，就是重定向了，找不到路由时可以跳转到指定的路由。
 
 
 
