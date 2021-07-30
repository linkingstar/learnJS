## 概述

除了核心功能默认内置的指令 (`v-model` 和 `v-show`)，Vue 也允许注册自定义指令。

以自动focus为例，我们定义了一个自定义的 `focus`指令，代码如下

```jsx
// 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})
```

除开全局注册意外，也可以只在某个组件上注册指令

```jsx
// ... 组件注册的代码
directives: {
  focus: {
    // 指令的定义
    inserted: function (el) {
      el.focus()
    }
  }
}
```

然后你可以在模板中任何元素上使用新的 `v-focus` property，如下：

```jsx
<input v-focus>
```


## 钩子函数可选的key

一个指令定义对象可以提供如下几个钩子函数 (均为可选)：

- `bind`：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。

- `inserted`：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。

- `update`：所在组件的 VNode 更新时调用，**但是可能发生在其子 VNode 更新之前**。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)。

  >  我们会在[稍后](https://cn.vuejs.org/v2/guide/render-function.html#虚拟-DOM)讨论[渲染函数](https://cn.vuejs.org/v2/guide/render-function.html)时介绍更多 VNodes 的细节。

- `componentUpdated`：指令所在组件的 VNode **及其子 VNode** 全部更新后调用。
- `unbind`：只调用一次，指令与元素解绑时调用。

可以根据实际需求选择实现不同的指令钩子函数

## 钩子函数参数定义

指令钩子函数会被传入以下参数：

```js
function hooks(el, //元素
               binding, //包含指令参数，值等属性
               vnode, //虚拟节点
               oldVnode //上次的虚拟节点)
```

- `el`：指令所绑定的元素，可以用来直接操作 DOM。

- ```
  binding
  ```

  ：一个对象，包含以下 property：

  - `name`：指令名，不包括 `v-` 前缀。
  - `value`：指令的绑定值，例如：`v-my-directive="1 + 1"` 中，绑定值为 `2`。
  - `oldValue`：指令绑定的前一个值，仅在 `update` 和 `componentUpdated` 钩子中可用。无论值是否改变都可用。
  - `expression`：字符串形式的指令表达式。例如 `v-my-directive="1 + 1"` 中，表达式为 `"1 + 1"`。
  - `arg`：传给指令的参数，可选。例如 `v-my-directive:foo` 中，参数为 `"foo"`。
  - `modifiers`：一个包含修饰符的对象。例如：`v-my-directive.foo.bar` 中，修饰符对象为 `{ foo: true, bar: true }`。

- `vnode`：Vue 编译生成的虚拟节点。移步 [VNode API](https://cn.vuejs.org/v2/api/#VNode-接口) 来了解更多详情。

- `oldVnode`：上一个虚拟节点，仅在 `update` 和 `componentUpdated` 钩子中可用。

## 自定义函数的使用

指令的参数可以是动态的。例如，在 `v-mydirective:[argument]="value"` 中，`argument` 参数可以根据组件实例数据进行更新！这使得自定义指令可以在应用中被灵活使用。

```jsx
v-mydirective:[argument]="value"
```

### 通过静态参数使用

例如下面的使用的参数是`foo`, 而 a,b被称之为modifier。对应的value为 `message`

```jsx
<div id="hook-arguments-example" v-demo:foo.a.b="message"></div>
```



### 通过动态参数使用

假如我们定义了一个pin指令，用来接收不同的参数，修改元素pin的位置

```jsx
<div id="dynamicexample">
  <h3>Scroll down inside this section ↓</h3>
  <p v-pin:[direction]="200">I am pinned onto the page at 200px to the left.</p>
</div>
```

此处的`direction`即为动态参数

```jsx
//判断参入的指令参数，来决定修改不同的元素样式
Vue.directive('pin', {
  bind: function (el, binding, vnode) {
    el.style.position = 'fixed'
    var s = (binding.arg == 'left' ? 'left' : 'top')
    el.style[s] = binding.value + 'px'
  }
})

new Vue({
  el: '#dynamicexample',
  data: function () {
    return {
      direction: 'left'
    }
  }
})
```

## 函数简写

如果只希望定义`bind`,`update`为同一个钩子函数，那么可以按照下面的形式进行简写

```jsx
Vue.directive('color-swatch', function (el, binding) {
  el.style.backgroundColor = binding.value
})
```

这样就省略掉了对象定义，直接传入了钩子函数。

## 传入object作为value

如果指令需要多个值，可以传入一个 JavaScript 对象字面量。记住，指令函数能够接受所有合法的 JavaScript 表达式。

```jsx
// 指令的value可以传入合法的js表达式，当然也支持传入一个object定义
<div v-demo="{ color: 'white', text: 'hello!' }"></div>

// 读取binding对象的value
Vue.directive('demo', function (el, binding) {
  console.log(binding.value.color) // => "white"
  console.log(binding.value.text)  // => "hello!"
})
```

## [总结](https://cn.vuejs.org/v2/guide/custom-directive.html)

自定义指令主要是用来触发元素对应的钩子函数的调用，并且在钩子函数中操纵元素或者修改元素的属性。最终会给元素或者自定义组件赋予额外的扩展能力。

> 往往这些额外能力都是相对通用的

