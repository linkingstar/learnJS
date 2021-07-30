## 概述

vue通过Mixin的方式来实现多组件之前的能力复用，组件之前通过Vue.extend传入Mixin的配置项，完成相关功能项的复用。

```jsx
// 定义一个混入对象
var myMixin = {
  created: function () {
    this.hello()
  },
  methods: {
    hello: function () {
      console.log('hello from mixin!')
    }
  }
}

// 定义一个使用混入对象的组件
var Component = Vue.extend({
  mixins: [myMixin]
})

var component = new Component() // => "hello from mixin!"
```

这些配置项实际上与 Vue 组件的定义配置项相对应的。

## 合并规则

- 数据合并

  不存在冲突项，则直接合并，存在冲突这使用组件自身的数据项

- 钩子函数的合并

  同名钩子函数被合并成数组，Mixin对象的钩子将会先被调用，然后再调用组件自身的钩子函数

- 值为对象的选项，例如 `methods`、`components` 和 `directives`，将被合并为同一个对象。两个对象键名冲突时，取组件对象的键值对。

## 全局Mixin

vue支持全局Mixin，但是使用时需要特别小心，而且调试跟定位也没那么方便

```jsx
// 为自定义的选项 'myOption' 注入一个处理器。
Vue.mixin({
  created: function () {
    var myOption = this.$options.myOption
    if (myOption) {
      console.log(myOption)
    }
  }
})

new Vue({
  myOption: 'hello!'
})
// => "hello!"
```

Mixin支持用户自定义合并的规则，修改默认的合并策略

[参考文档](https://cn.vuejs.org/v2/guide/mixins.html)

