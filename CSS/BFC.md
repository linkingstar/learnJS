# Block formatting context（块格式化上下文）

BFC 主要是用来进行 css layout 的，BFC 是一个最小的布局单元。一个 BFC 会包含 layout 内部的所有元素。

```html
<div class="outer">
  <div class="float">I am a floated element.</div>
  I am text inside the outer box.
</div>
```

```css
.outer {
  border: 5px dotted rgb(214, 129, 137);
  border-radius: 5px;
  width: 450px;
  padding: 10px;
  margin-bottom: 40px;
}

.float {
  padding: 10px;
  border: 5px solid rgba(214, 129, 137, 0.4);
  border-radius: 5px;
  background-color: rgba(233, 78, 119, 0.4);
  color: #fff;
  float: left;
  width: 200px;
  margin: 0 20px 0 0;
}
```

当文字足够多时，整个外部容器可以被撑开
![](https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/cf72a345-d837-4524-a9a7-47a75b281589/floats1-800w-opt.png)

当文字较少时，外层容器不能被撑开，因为浮动元素会脱离文档流
![](https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/f40fbaa1-771c-4655-82bb-d16ec1e4f447/floats2-800w-opt.png)

可以通过两种方式来解决这个问题，一个是通过在外层容器的:after 上添加 clear: both;

```css
.group:after {
  content: '';
  display: table;
  clear: both;
}
```

或者手动创建一个 BFC

```css
/* 使用auto */
.outer {
  overflow: auto;
}
/* flow-root新属性 */
.outer {
  display: flow-root;
}
```

# 创建 BFC 的方式

以下的任何一种方式都会创建 BFC

- html 根标签
- float 不为 none
- 绝对布局 position fixed absolute
- inline blocks
- table cells
- table captions
- 匿名的 table cells（由 display table,table row,table-row-group 等属性创建）
- overflow 不为 Visible 和 clip 的 block 元素
- display flow-root
- contain：layout,content,paint
- flex items
- grid items
- 多列布局
- column-span 属性


格式化上下文会影响布局，通常我们会创建一个新的 BFC 来进行定位跟清除浮动，而不是去改变布局。创建在元素上的 BFC 拥有以下的特性
  - 可以包含内部的 float
  - 可以排除外部的 float
  - 可以避免 margin 折叠

> [参考文档](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Block_formatting_context)
