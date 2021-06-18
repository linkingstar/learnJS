# Animation 的效率

![](https://www.html5rocks.com/en/tutorials/speed/high-performance-animations/cheap-operations.jpg)

如果动画只涉及：position，scale，rotate，不透明度的变化，那么动画是很高效的  
也就是说动画不涉及到变更 layout，不重新计算元素的位置跟大小，那么就是高效的。

生成动画的过程如下：

![](https://www.html5rocks.com/en/tutorials/speed/high-performance-animations/devtools-waterfall.jpg)

- 重新计算 style
- 进行 layout
- 进行绘制
- 合成多个 layers
- 绘制到屏幕上

当动画是改变了元素的 transform 和元素的不透明度时，只会导致多个 layers 的合成，因此该操作是高效的

# 跟 layout 有关的动画属性

常见的就是改变元素的 width,height,padding,margin,display,top,left,right 等等

| width          | height       |
| -------------- | ------------ |
| padding        | margin       |
| display        | border-width |
| border         | top          |
| position       | font-size    |
| float          | text-align   |
| overflow-y     | font-weight  |
| overflow       | left         |
| font-family    | line-height  |
| vertical-align | right        |
| clear          | white-space  |
| bottom         | min-height   |

# 涉及到重绘有关的属性

现在大多数浏览器的绘制操作都是基于软件光栅化完成的。**处于重绘元素背后的元素也可能会被重绘，这取决于你app中的元素如何在layers中进行分组。**
会导致重绘的主要属性如下

| - | - |
| ------------------- | ----------------- |
| color          			| border-style      |
| visibility          | background        |
| text-decoration     | background-image  |
| background-position | background-repeat |
| outline-color       | outline           |
| outline-style       | border-radius     |
| outline-width       | box-shadow        |
| background-size     |                   |

# 动画组合属性

- opacity 不透明度
  为了保证属性生效，该元素必须是layer中的唯一元素，**如果该元素的与其他元素都在同一个layer中，则会导致其他元素的不透明度也发生变化。**

  > 现在主流的浏览器都会为设置了opacity属性的元素创建独立的layer，之前也有用户采用 `translateZ(0)`或者`translate3d(0,0,0)`手动创建layer
  
- 尽量使用transform

  使用transform来改变元素的位置，而不是直接去改变元素的left/right等属性，因为后者会引起layout。

# JS Animation vs CSS Animation

## JS动画的利弊

- JS动画在主线程中运行，这既是js动画的优点，也是js动画的缺点。因为js主线程需要运行js，样式计算，layout以及painting，导致js主线程十分繁忙。**这样会导致动画掉帧**。

- 通过JS动画可以轻易控制动画的开始，暂停，反转，中断以及取消。也存在一些效果必须使用JS动画才能实现，例如[视差滚动](https://www.html5rocks.com/en/tutorials/speed/parallax/)效果

## CSS动画的利弊

浏览器可以对动画进行优化，必要的情况下会创建layer，并且在非主线程中执行相关操作。但是弊端是失去了JS动画提供的强大能力，很难将多个动画有意义的合并在一起。

# 展望一下未来

随着web标准的发展，一些跟动画有关的限制也不再存在。Google有一个关于动画的提案，建议支持在workers中执行执行**不触发layout跟样式计算**的动画

# 总结

动画是web体验的核心能力，我们应该尽量避免使用会触发layout跟重绘的动画，二者都十分昂贵并且可能会导致掉帧。由于浏览器可以针对css动画进行性能优化，所以css动画在性能上是要优于JS动画的。

当前transforms是最佳的动画属性，如果可以尽量使用以下属性进行动画

- opacity
- translate
- rotate
- scale

# [css动画教程](https://codeburst.io/a-guide-to-css-animation-part-1-8777f5beb1f8)

## keyframes

```css
@keyframes spin {
  // can remove this one
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

新建一个spin 旋转动画，然后将spin应用到某个div上

```css
div {
  animation-name: spin;
  animation-duration: 2s;
}
```

## 路径动画

```css
div {
  animation-name: squarePath;
  animation-duration: 2s;
}

@keyframes squarePath {
  0%, 100% {
    transform: translate(-100%, -100%);
  }
  25% {
    transform: translate(100%, -100%);
  }
  50% {
    transform: translate(100%, 100%);
  }
  75% {
    transform: translate(-100%, 100%);
  }
}
```

![](https://miro.medium.com/max/960/1*DStBjpP9QnRY8dVVzFP8xA.gif)

## 添加循环次数  animation-iteration-count

```css
div {
  animation-name: spin;
  animation-duration: 2s;
  // animation-iteration-count: 5;
  animation-iteration-count: infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## 时间函数 animation-timing-function

- `cubic-bezier(x1, y1, x2, y2)` - 通过贝塞尔曲线来控制动画的快慢
- `ease` - start and end slowly but speedier in the middle(default)
- `ease-in`- start slowly
- `ease-in-out` - start and end slowly but not the same as `ease`
- `ease-out` - end slowly
- `linear` - maintain speed throughout
- `steps(number, direction <optional>)` - provides a way to split the animation into equal steps. `direction` values can either be `start` or `end`. `start` means that the first step happens at the start of the animation. `end` means that the last step happens at the end of the animation. `end` is the default value.

## 控制动画的运行 animation-play-state

```css
div {
  animation-name: spin;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-play-state: paused;
}

:checked ~ div {
  animation-play-state: running;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

当选中checkbox之后才开始动画，`animation-play-state`可以设置为paused或者running

## 动画延时 animation-delay

当设置动画延时之后，divs将按照顺序执行

```css
div {
  animation-name: spin;
  animation-duration: 1s;
  animation-timing-function: ease-out;
}

div:nth-of-type(1) {
  animation-delay: 0s;
}

div:nth-of-type(2) {
  animation-delay: .5s;
}

div:nth-of-type(3) {
  animation-delay: 1s;
}

@keyframes spin {
  0, 50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

## 最终状态 animation-fill-mode

以一个将大小缩小到自身一半的动画为例，如果不设置fill-mode，那么在动画接结束之后，元素会重置为原先的大小。

```css
div {
  animation-name: shrink;
  animation-duration: .5s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
  animation-delay: 1s;
}

@keyframes shrink {
  to {
    transform: scale(0.5);
  }
}
```

当设置为`forwards`之后，元素会保持为最后的状态，而设置为`backwards`元素则会保持为delay之前的初始状态

## 运行方向 animation-direction

- `alternate`- the direction of the animation alternates on each iteration

  先正向运行，再反向运行，可以结合animation-iteration-count使用

- `alternate-reverse`- same as `alternate` but starts in `reverse`

  类似于上一个属性，只不过是先反向运行，再正向运行

- `normal` - self explanatory

  默认属性：正向运行

- `reverse` - the animation is played in reverse

  反向运行

## 动画简写

动画可以简写到一行

![动画简写](https://miro.medium.com/max/700/1*08nwrxY4gHU2uT2iz-gHtg.png)

```css

div {
  animation: flyIn .5s forwards, rotate .5s .75s forwards;
}
@keyframes flyIn {
  from {
    opacity: 0;
    transform: translateY(300%) scale(0);
  }
}
@keyframes rotate {
  to {
    transform: rotate(45deg);
  }
}
```



# 动画中使用css变量

```css
div {
  animation: change .5s cubic-bezier(1,.2,.6,1.75) 1s forwards;
}

div:nth-of-type(1) {
  --scale: 1.2;
}

div:nth-of-type(2) {
  --scale: 2.6;
}

div:nth-of-type(3) {
  --scale: 1.8;
}

@keyframes change {
  to {
    transform: scale(var(--scale));
  }
}
```

**除此之外，可以通过js来控制变量，或者通过css来控制变量**，相关的demo可以[查看文档](https://codeburst.io/a-guide-to-css-animation-part-3-2e497110119)
