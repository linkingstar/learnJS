列出一些不怎么常用的属性

## flex-basis

参考文档：https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis

> flex-basis: auto/content/number;

The **`flex-basis`** [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) property sets the initial main size of a flex item. It sets the size of the content box unless otherwise set with [`box-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing).

也就是说该属性是用来设置item在**主轴**上**初始的大小**（row对应width，column对应height）

> 注意：如果同时设置了flex-basis跟(width/height)，flex-basis权限更高

## order

指定item在flex布局中的显示顺序，默认为0，数字越高越靠后显示，可以设置为负数，数字越小越最先显示。如果未指定order则按照代码中的先后顺序进行显示

## flex-shrink



