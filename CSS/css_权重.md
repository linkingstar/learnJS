# css 权重

- import!
- inline style(行内样式) 1000
  > 注意：写在html style内部的样式叫行内样式，不叫内联样式，内联样式指的是写在`<style> </style>`内部的样式

- #id +100
- 属性选择器[attr='??'] 、.class、 伪类(:hover,:active) +10
- 元素选择(类似div,p,h1)，伪元素(:before,:after),css运算符 +1
- 通配符（*）+ 0

除开`!import`行内样式的优先级最高，然后是id选择器

## 样式重复

当样式重复时，后面的规则会覆盖前面的

```css
#box {
 background-color: green;
}
/* 这条生效 */
#box {
 background-color: blue;
}
```

## 不同权重，权重高的生效

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>权重高的样式生效</title>
		<style>
			/* 权重值：1 */
			div{
				width: 100px;
				height: 100px;
				background-color: red;
			}
 
			/* 权重值：10 */
			.box2{
				width: 100px;
				height: 100px;
				background-color: yellow;
			}
 
			/* 权重值：100 */
			#box{
				width: 100px;
				height: 100px;
				background-color: green;
			}
		</style>
	</head>
	<body>
		<div id='box' class='box2'></div>
	</body>
</html>
```

## 关于import

import可以提升权重，当存在多个import时，权重高的生效

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>当两个样式都使用!important时</title>
		<style>
			.box{
				width: 100px;
				height: 100px;
				background-color: red !important;
			}
 
			div{
				width: 100px;
				height: 100px;
				background-color: green !important;
			}
		</style>
	</head>
	<body>
		<!-- 当两个样式都使用!important时，权重值大的优先级更高 -->
		<div class='box'></div>
	</body>
</html>
```

## 行内、内联和外联样式优先级

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>css优先级</title>
    <!-- 外联样式 -->
		<link rel='stylesheet' href='css/styles.css'>
     <!-- 内联样式 -->
		<style>
	        div{
	        	background-color: blue;
	        }
	        #box{
	            background-color: green;
	        }
		</style>
	</head>
	<body>
		<!-- 行内样式生效 -->
		<div id="box" style="background-color: red;width: 100px;height: 100px;"></div>
	</body>
</html>
```

由于行内样式的优先级最高，所以上方的代码行内样式生效。

如果不存在行内样式，那么跟css样式加载的顺序有关，最后加载的样式生效。

总结一下：***!important > 行内样式 > 内联样式 and 外联样式***

1. 常用选择器权重优先级：***!important > id > class > tag\***
2. !important可以提升样式优先级，但不建议使用。如果!important被用于一个简写的样式属性，那么这条简写的样式属性所代表的子属性都会被应用上!important。 例如：*background: blue !important;*
3. 如果两条样式都使用!important，则权重值高的优先级更高
4. 在css样式表中，同一个CSS样式你写了两次，后面的会覆盖前面的
5. 样式指向同一元素，权重规则生效，权重大的被应用
6. 样式指向同一元素，权重规则生效，权重相同时，就近原则生效，后面定义的被应用
7. 样式不指向同一元素时，权重规则失效，就近原则生效，离目标元素最近的样式被应用

[参考文档](https://zhuanlan.zhihu.com/p/41604775)

