# 为什么需要 React Fiber

在 React 之前的版本，如果存在大量的同步计算，则会导致浏览器的 ui 被阻塞。默认情况下，js 的计算，页面的布局跟渲染都是发生在主线程。React 的每次渲染都会对两次渲染树进行比较，如果这个过程过于耗时，就会导致页面卡顿，而 React Fiber 则是为了解决这个问题而出现的

# React Fiber 的原理

React Fiber 通过将一个大的任务拆分成一系列的小任务，并且基于浏览器的`requestIdleCallback`方法来完成任务的执行。

Fiber 实现了自己的组件调用栈，而不是基于 JS 本身的调用栈，JS 本身的调用栈会一直执行，知道 stack 为空才能结束。Fiber 的调用栈可以再任何时候暂停，继续，甚至撤销调用。Fiber 在执行完一个任务之后，又会将控制权交给浏览器，然后在合适的时间继续执行。

> window.requestIdleCallback()会在浏览器空闲时期依次调用函数，这就可以让开发者在主事件循环中执行后台或低优先级的任务，而且不会对像动画和用户交互这些延迟触发但关键的事件产生影响。函数一般会按先进先调用的顺序执行，除非函数在浏览器调用它之前就到了它的超时时间。

# React Fiber 的实现方式

React 的框架主要分为 3 层

- Virtual DOM，描述页面有哪些元素
- Reconciler 层（协调层），负责调用组件生命周期方法，进行 diff 运算等。
- Render 层，根据不同的平台(React,RN)渲染页面
  因此这次改动主要是在 Reconciler 层，Fiber 的数据结构如下

```js
const fiber = {
    stateNode,    // 节点实例
    child,        // 子节点
    sibling,      // 兄弟节点
    return,       // 父节点
}
```

Fiber 使用了任务调度器来进行任务的分配，任务的优先级可以分为以下几种

- synchronous，与之前的 Stack Reconciler 操作一样，同步执行
- task，在 next tick 之前执行
- animation，下一帧之前执行
- high，在不久的将来立即执行
- low，稍微延迟执行也没关系
- offscreen，下一次 render 时或 scroll 时才执行

Fiber 执行的过程中分为两个阶段
![](https://segmentfault.com/img/bVboJH6?w=1076&h=697)

- 阶段一，生成 Fiber 树，得出需要更新的节点信息。这一步是一个渐进的过程，可以被打断。
- 阶段二，将需要更新的节点一次性批量更新，这个过程不能被打断。

# Fiber 树

Fiber 树是在 Reconciler 在阶段基于 Virtual DOM 树生成的，本质上是一个多级链表（实际上也算一颗树）

![](https://segmentfault.com/img/bVboJHa?w=970&h=732)

可以看出这个这种数据接口在多个方向上都存在链接关系

Fiber 树在首次渲染的时候会一次性生成。在后续需要 Diff 的时候，会根据已有树和最新 Virtual DOM 的信息，生成一棵新的树。这颗新树每生成一个新的节点，都会将控制权交回给主线程，去检查有没有优先级更高的任务需要执行。如果没有，则继续构建树的过程。

https://zh-hans.reactjs.org/docs/codebase-overview.html#fiber-reconciler

https://nanyang.io/post/deep-dive-into-react-fiber

6https://blog.logrocket.com/deep-dive-into-react-fiber-internals/
