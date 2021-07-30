# 概述

render函数适合动态创建组件的场景，如果采用模板进行创建，会导致代码十分冗余，假设我们需要提供一个组件，根据用户传递的level来生成对应的标题，比如 level为1，对应h1,level为2对应h2，那么采用模板的方式编写的代码可能如下

```jsx
<script type="text/x-template" id="anchored-heading-template">
  <h1 v-if="level === 1">
    <slot></slot>
  </h1>
  <h2 v-else-if="level === 2">
    <slot></slot>
  </h2>
  <h3 v-else-if="level === 3">
    <slot></slot>
  </h3>
  <h4 v-else-if="level === 4">
    <slot></slot>
  </h4>
  <h5 v-else-if="level === 5">
    <slot></slot>
  </h5>
  <h6 v-else-if="level === 6">
    <slot></slot>
  </h6>
</script>

Vue.component('anchored-heading', {
  template: '#anchored-heading-template',
  props: {
    level: {
      type: Number,
      required: true
    }
  }
})
```

对于上面的 HTML，你决定这样定义组件接口：

```jsx
<anchored-heading :level="1">Hello world!</anchored-heading>
```

这样显得十分低效且代码冗余，如果采用render方法改下，则会十分的简单

```jsx
Vue.component('anchored-heading', {
  render: function (createElement) {
    return createElement(
      'h' + this.level,   // 标签名称
      this.$slots.default // 子节点数组
    )
  },
  props: {
    level: {
      type: Number,
      required: true
    }
  }
})
```

通过动态设置标签，以及子节点，达到与上面一样的目的

# createElement

createElement实际上是创建了一个虚拟DOM，用来描述节点的信息，可以简称为vnode

## 参数

