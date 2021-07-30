# 插槽的基础使用规则

例如我们定义了一个link组件，接受一个url作为herf，并且允许自定义链接内部展示的内容。

组件定义如下

```jsx
Vue.Component('navigation-link',{
  props:[url],
  template:`
<a
  v-bind:href="url"
  class="nav-link"
>
  <slot></slot>
</a>
`
})
```

因此我们可以在外层这样使用这个组件

```jsx
<navigation-link url="/profile">
  Your Profile
</navigation-link>
```

甚至其它的组件：

```jsx
<navigation-link url="/profile">
  <!-- 添加一个图标的组件 -->
  <font-awesome-icon name="user"></font-awesome-icon>
  Your Profile
</navigation-link>
```

> 如果 `<navigation-link>` 的 `template` 中**没有**包含一个 `<slot>` 元素，则该组件起始标签和结束标签之间的任何内容都会被抛弃。

# slot的作用域

在外层使用`<navigation-link> `时，被包裹的内部默认只能访问当前作用域的数据，而不能访问`<navigation-link> `内部的数据。

```jsx
<navigation-link url="/profile">
  Clicking here will send you to: {{ url }}
  <!--
  这里的 `url` 会是 undefined，因为其 (指该插槽的) 内容是
  _传递给_ <navigation-link> 的而不是
  在 <navigation-link> 组件*内部*定义的。
  -->
</navigation-link>
```

比如上面的代码试图访问url，但是在当前环境中url是未定义的

> 父级模板里的所有内容都是在父级作用域中编译的；子模板里的所有内容都是在子作用域中编译的。

# 提供slot的备选渲染项

我们在定义slot的时候可以为slot提供备选渲染项，比如这里有一个`<submit-button>`组件，并且定义如下

```jsx
// submit button 定义
<button type="submit">
  <slot>Submit</slot>
</button>
```

被`<slot></slot>`包裹的内容即为备选项，当用户直接使用该组件不传入任何元素时

```jsx
<submit-button></submit-button>
```

将会被渲染成

```jsx
<button type="submit">
  Submit
</button>
```

如果用户传入了其他内容，则会直接渲染用户传入的内容

```jsx
<submit-button>
  Save
</submit-button>
//渲染为
<button type="submit">
  Save
</button>
```

# 给slot命名

如果在一个组件中定义了多个插槽，我们可以为每个插槽进行命名，方便外层针对不同的插槽传递不同的值

假设我们定义了一个`base-layout` 组件如下

```jsx
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <!-- name为default -->
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

外层使用时，可以针对不同的插槽传入不同的内容

```jsx
<base-layout>
  <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>

  <p>A paragraph for the main content.</p>
  <p>And another one.</p>

  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

主要会用到`template`以及`v-slot`指令

> v-slot必须与template配套使用

# 为插槽设置作用域

假设我们有一个 `current-user` 组件，该组件可以接受一个`user`属性，组件模板定义如下

```jsx
<span>
  <slot>{{ user.lastName }}</slot>
</span>
```

由上面的讨论可知，想要在使用current-user的时候直接访问user是不行的

```jsx
//试图slot中访问user，但是实际上是不行的
<current-user>
  {{ user.firstName }}
</current-user>
```

为了解决这个问题，vue允许为插槽绑定作用域，也就是可以修改`current-user`代码如下，为slot绑定作用域 `user`

```jsx
<span>
  <slot v-bind:user="user">{{ user.lastName }}</slot>
</span>
```

同时改写调用处的代码如下:

```jsx
<current-user>
  <template v-slot:default="slotProps">
    {{ slotProps.user.firstName }}
  </template>
</current-user>
```

在外层使用v-slot获取到对应的slot属性，并且从slot属性中获取到user的值

## Default slot 简写

默认插槽可以进一步简写，省略掉 template以及 v-slot: 后的default

```jsx
<current-user v-slot="slotProps">
  {{ slotProps.user.firstName }}
</current-user>
```

但是如果存在多个插槽时，则不能进行简写了

```jsx
<current-user>
  <template v-slot:default="slotProps">
    {{ slotProps.user.firstName }}
  </template>

  <template v-slot:other="otherSlotProps">
    ...
  </template>
</current-user>
```

## slot props 支持解构赋值

v-slot支持传入解构赋值的表达式

```jsx
<current-user v-slot="{ user }">
  {{ user.firstName }}
</current-user>

// 修改别名
<current-user v-slot="{ user: person }">
  {{ person.firstName }}
</current-user>

//设置默认值
<current-user v-slot="{ user = { firstName: 'Guest' } }">
  {{ user.firstName }}
</current-user>
```



## 动态插槽命名

```jsx
<base-layout>
  <template v-slot:[dynamicSlotName]>
    ...
  </template>
</base-layout>
```

## v-slot简写

类似于v-bind ,v-on，v-slot也可以进行简写

> 例如将 v-slot:header替换成 #header

上方的例子可以简写成下面的样子

```jsx
<base-layout>
  <template #header>
    <h1>Here might be a page title</h1>
  </template>

  <p>A paragraph for the main content.</p>
  <p>And another one.</p>

  <template #footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

对于不带名字的简写需要写明`default`

```jsx
<current-user #default="{ user }">
  {{ user.firstName }}
</current-user>
```

# 插槽属性允许外部进行自定义

假如我们实现一个 `<todo-list>` 组件如下

```jsx
<ul>
  <li
    v-for="todo in filteredTodos"
    v-bind:key="todo.id"
  >
    {{ todo.text }}
  </li>
</ul>
```

为了外部在调用时动态的修改item的内容，我们改写这个组件定义为`slot`模式，并且在`slot`上绑定了`todo`属性，允许在外部调用时使用插槽属性`todo`，并访问到`todo`内部的值。

```jsx
<ul>
  <li
    v-for="todo in filteredTodos"
    v-bind:key="todo.id"
  >
    <!--
    我们为每个 todo 准备了一个插槽，
    将 `todo` 对象作为一个插槽的 prop 传入。
    -->
    <slot name="todo" v-bind:todo="todo">
      <!-- 后备内容 -->
      {{ todo.text }}
    </slot>
  </li>
</ul>
```

这样外部在调用的时候，就可以根据自己的需求来变更 `li` 中显示的内容了

```jsx
<todo-list v-bind:todos="todos">
  <template v-slot:todo="{ todo }">
    <span v-if="todo.isComplete">✓</span>
    {{ todo.text }}
  </template>
</todo-list>
//可以简写成
<todo-list :todos="todos">
  <template #todo="{ todo }">
    <span v-if="todo.isComplete">✓</span>
    {{ todo.text }}
  </template>
</todo-list>
```

