# React15 架构
React15的架构主要包含两层
- 协调器
- 渲染器
协调器负责找出每次更新的差异，并生成虚拟DOM，而渲染层则负责将虚拟DOM渲染出来

## 协调器
React 可以通过setState,forceUpdate,render等api触发界面更新。
每当发生更新的时，协调器(Reconciler)会进行以下工作
- 调用函数组件、或class组件的render方法，将返回的JSX转化为虚拟DOM
- 将虚拟DOM和上次更新时的虚拟DOM对比
- 通过对比找出本次更新中变化的虚拟DOM
- 通知Renderer将变化的虚拟DOM渲染到页面上

> 转化虚拟DOM -> 对比先后的vDom并找出差异->通知渲染器渲染vDom

## 渲染器
针对不同的平台，提供了不同的渲染器，比如web端的ReactDom,App原生的ReactNative，用于测试的ReactTest，以及用来渲染Canvas，SVG以及VML的ReactArt

## React15存在的问题
react15在mount时会递归调用mountComponent，update时会递归调用updateComponent
如果使用递归调用就会导致一旦执行了就不可中断，而且一旦调用层级过深，就会导致执行时间超过16ms，用户就会觉得卡顿


# React16+ 的架构

React16架构可以分为三层：

- Scheduler（调度器）—— 调度任务的优先级，高优任务优先进入**Reconciler**
- Reconciler（协调器）—— 负责找出变化的组件
- Renderer（渲染器）—— 负责将变化的组件渲染到页面上

可以看到，相较于React15，React16中新增了**Scheduler（调度器）**，让我们来了解下他。

### [](https://react.iamkasong.com/preparation/newConstructure.html#scheduler-调度器)

### Scheduler（调度器）

控制任务的优先级以及对任务进行调度，达到分时的目的

### Reconciler（协调器）

因为React15的协调器是基于递归的栈调用，耗时切不可中断，新的协调器将递归改成了循环，并且循环还能被中断掉

```js
/** @noinline */
function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

每次循环都会调用`shouldYield`判断是否还有剩余时间可以继续执行代码

### 那么React16是如何解决中断更新时DOM渲染不完全的问题呢？

在React16中，**Reconciler**与**Renderer**不再是交替工作。当**Scheduler**将任务交给**Reconciler**后，**Reconciler**会为变化的虚拟DOM打上代表增/删/更新的标记，类似这样

```js
export const Placement = /*             */ 0b0000000000010;
export const Update = /*                */ 0b0000000000100;
export const PlacementAndUpdate = /*    */ 0b0000000000110;
export const Deletion = /*              */ 0b0000000001000;
```

**当且仅当所有的组件都被打上标记之后才会统一提交给渲染器渲染。**

### Renderer（渲染器）

**Renderer**根据**Reconciler**为虚拟DOM打的标记，同步执行对应的DOM操作。

在React16架构中整个更新流程为：

![更新流程](https://react.iamkasong.com/img/process.png)

其中红框中的步骤随时可能由于以下原因被中断：

- 有其他更高优任务需要先更新
- 当前帧没有剩余时间

由于红框中的工作都在内存中进行，不会更新页面上的DOM，所以即使反复中断，用户也不会看见更新不完全的DOM

# React Fiber

> `React Fiber`可以理解为：
>
> `React`内部实现的一套状态更新机制。支持任务不同`优先级`，可中断与恢复，并且恢复后可以复用之前的`中间状态`。
>
> 其中每个任务更新单元为`React Element`对应的`Fiber节点`。

## Fiber的含义

`Fiber`包含三层含义：

1. 作为架构来说，之前`React15`的`Reconciler`采用递归的方式执行，数据保存在递归调用栈中，所以被称为`stack Reconciler`。`React16`的`Reconciler`基于`Fiber节点`实现，被称为`Fiber Reconciler`。
2. 作为静态的数据结构来说，每个`Fiber节点`对应一个`React element`，保存了该组件的类型（函数组件/类组件/原生组件...）、对应的DOM节点等信息。
3. 作为动态的工作单元来说，每个`Fiber节点`保存了本次更新中该组件改变的状态、要执行的工作（需要被删除/被插入页面中/被更新...）。

## Fiber工作原理

`React`使用“双缓存”来完成`Fiber树`的构建与替换——对应着`DOM树`的创建与更新。

在React中最多存在两颗Fiber树，当前显示的Fiber树被定义为current，正在生成的树被定义成workInProcess，两棵树之前通过`alternate`属性连接

```js
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

以下面这段代码为例，来看看Fiber的双缓存机制是如何工作的

```js
function App() {
  const [num, add] = useState(0);
  return (
    <p onClick={() => add(num + 1)}>{num}</p>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'));
```

1、当首次执行ReactDom.render方法时会创建fiberRootNode节点，该节点通过`current`指向了新生成的Fiber树的根节点`rootFiber。`

current指针在合适的时候会指向新生成的workInProcess fiber树。

```js
fiberRootNode.current = rootFiber;
```

2、在渲染阶段，根据组件返回的JSX生成Fiber节点。并以rootFiber为根节点生成一颗Fiber树（workInProcess）

在构建`workInProgress Fiber树`时会尝试复用`current Fiber树`中已有的`Fiber节点`内的属性，在`首屏渲染`时只有`rootFiber`存在对应的`current fiber`（即`rootFiber.alternate`）。

![workInProgressFiber](https://react.iamkasong.com/img/workInProgressFiber.png)

3、图中的workInProcess Fiber树在commit阶段之后渲染到页面，此时`DOM`更新为右侧树对应的样子。`fiberRootNode`的`current`指针指向`workInProgress Fiber树`使其变为`current Fiber 树`。

![workInProgressFiberFinish](https://react.iamkasong.com/img/wipTreeFinish.png)

更新update

1. 接下来我们点击`p节点`触发状态改变，这会开启一次新的`render阶段`并构建一棵新的`workInProgress Fiber 树`。
![wipTreeUpdate](https://react.iamkasong.com/img/wipTreeUpdate.png)

和`mount`时一样，`workInProgress fiber`的创建可以复用`current Fiber树`对应的节点数据。

> 这个决定是否复用的过程就是Diff算法，后面章节会详细讲解

2. `workInProgress Fiber 树`在`render阶段`完成构建后进入`commit阶段`渲染到页面上。渲染完毕后，`workInProgress Fiber 树`变为`current Fiber 树`。

![currentTreeUpdate](https://react.iamkasong.com/img/currentTreeUpdate.png)

## 总结

- `Reconciler`工作的阶段被称为`render`阶段。因为在该阶段会调用组件的`render`方法。
- `Renderer`工作的阶段被称为`commit`阶段。就像你完成一个需求的编码后执行`git commit`提交代码。`commit`阶段会把`render`阶段提交的信息渲染在页面上。
- `render`与`commit`阶段统称为`work`，即`React`在工作中。相对应的，如果任务正在`Scheduler`内调度，就不属于`work`。

在`架构篇`我们会分别讲解`Reconciler`和`Renderer`的工作流程，所以章节名分别为`render阶段`和`commit阶段`。



# Fiber解析

## Fiber节点的创建逻辑

```js
// performSyncWorkOnRoot会调用该方法
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

// performConcurrentWorkOnRoot会调用该方法
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

可以看到，他们唯一的区别是是否调用`shouldYield`。如果当前浏览器帧没有剩余时间，`shouldYield`会中止循环，直到浏览器有空闲时间后再继续遍历。

`workInProgress`代表当前已创建的`workInProgress fiber`。

`performUnitOfWork`方法会创建下一个`Fiber节点`并赋值给`workInProgress`，并将`workInProgress`与已创建的`Fiber节点`连接起来构成`Fiber树`。

因此实际上`performUnitOfWork`主要负责创建Fiber树。

## Fiber树的遍历以及递归逻辑

### 从rootFiber往下

首先从`rootFiber`开始向下深度优先遍历。为遍历到的每个`Fiber节点`调用[beginWork方法 (opens new window)](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L3058)。

该方法会根据传入的`Fiber节点`创建`子Fiber节点`，并将这两个`Fiber节点`连接起来。

当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段。

### 从叶子节点往上

在“归”阶段会调用[completeWork (opens new window)](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L652)处理`Fiber节点`。

当某个`Fiber节点`执行完`completeWork`，如果其存在`兄弟Fiber节点`（即`fiber.sibling !== null`），会进入其`兄弟Fiber`的“递”阶段(从兄弟节点往下遍历)。

如果不存在`兄弟Fiber`，会进入`父级Fiber`的“归”阶段。

“递”和“归”阶段会交错执行直到“归”到`rootFiber`。至此，`render阶段`的工作就结束了。（当回到起点，所有节点都调用了completeWork函数）

## beginWork

`beginWork`主要的目的就是创建新节点，下方是该函数的定义

```js
function beginWork(
  current: Fiber | null, //当前节点
  workInProgress: Fiber, //正在生成的Fiber树
  renderLanes: Lanes, //优先级，跟调度器有关（先忽略内部实现）
): Fiber | null {
  // ...省略函数体
}
```

当mount时，当前的Fiber为空，所以可以根据Fiber是否为空来判断当前是mount还是update

因此该函数可以分为两个分支进行讨论

- mount时：会根据不同的fiber.tag生成不同的节点

- upadte时：需要判断是否满足节点重用的条件，如果满足，那么就直接重用当前的节点。

  重用需要满足以下条件：

  节点的前后属性没有发生改变，并且节点的类型没有发生改变，且节点的优先级不够高，这可以重用当前的节点

  1. `oldProps === newProps && workInProgress.type === current.type`，即`props`与`fiber.type`不变
  2. `!includesSomeLane(renderLanes, updateLanes)`，即当前`Fiber节点`优先级不够，会在讲解`Scheduler`时介绍

## reconcileChildren

当mount时新建Fiber节点时，对于我们常见的组件类型，如（`FunctionComponent`/`ClassComponent`/`HostComponent`），最终会进入[reconcileChildren (opens new window)](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L233)方法。

该方法属于协调器的方法，该方法主要的职责如下

- 对于`mount`的组件，他会创建新的`子Fiber节点`
- 对于`update`的组件，他会将当前组件c与该组件在上次更新时对应的`Fiber节点`比较（也就是俗称的`Diff`算法），将比较的结果生成新`Fiber节点`

## effectTag

EffectTag用来标识在渲染器中要执行的DOM操作，截取一部分Tag如下

```js
// DOM需要插入到页面中
export const Placement = /*                */ 0b00000000000010;
// DOM需要更新
export const Update = /*                   */ 0b00000000000100;
// DOM需要插入到页面中并更新
export const PlacementAndUpdate = /*       */ 0b00000000000110;
// DOM需要删除
export const Deletion = /*                 */ 0b00000000001000;
```

> 通过二进制定义tag，是为了方便进行位运算

那么，如果要通知`Renderer`将`Fiber节点`对应的`DOM节点`插入页面中，需要满足两个条件：

1. `fiber.stateNode`存在，即`Fiber节点`中保存了对应的`DOM节点`
2. `(fiber.effectTag & Placement) !== 0`，即`Fiber节点`存在`Placement effectTag`

我们知道，`mount`时，`fiber.stateNode === null`，且在`reconcileChildren`中调用的`mountChildFibers`不会为`Fiber节点`赋值`effectTag`。那么首屏渲染如何完成呢？

第二个问题的答案十分巧妙：假设`mountChildFibers`也会赋值`effectTag`，那么可以预见`mount`时整棵`Fiber树`所有节点都会有`Placement effectTag`。那么`commit阶段`在执行`DOM`操作时每个节点都会执行一次插入操作，这样大量的`DOM`操作是极低效的。

为了解决这个问题，在`mount`时只有`rootFiber`会赋值`Placement effectTag`，在`commit阶段`只会执行一次插入操作。

## completeWork

该函数为Fiber生成虚拟的DOM节点，如果DOM节点已经存在，则同步新属性到DOM上。有差异的新属性被存放在workInProgress.updateQueue之中

```js
workInProgress.updateQueue = (updatePayload: any);
```

> 其中updatePayload为数组，其中偶数索引位为props key，奇数索引为props value。

该函数也可以分两种场景进行讨论

- update 如果当前已经创建了DOM，那么直接同步new props到DOM上
- mount 为Fiber节点生成对应的DOM节点，将子孙DOM节点与该节点建立关系，最终将props apply到DOM上

## effectList

为了避免在commit阶段又重新遍历Fiber树，我们会将具有effectTag的Fiber节点都放入effectList单向链表中，`effectList`中第一个`Fiber节点`保存在`fiber.firstEffect`，最后一个元素保存在`fiber.lastEffect`。

```js
                       nextEffect         nextEffect
rootFiber.firstEffect -----------> fiber -----------> fiber
```

这样，在`commit阶段`只需要遍历`effectList`就能执行所有`effect`了。

在流程的最后，会执行commitRoot函数，进入commit阶段

```js
commitRoot(root);
```

# Fiber commit阶段

commit阶段主要执行rootFiber.firstEffect链表中的副作用，除此之外，一些生命周期钩子（比如`componentDidXXX`）、`hook`（比如`useEffect`）需要在`commit`阶段执行。

`commit`阶段的主要工作（即`Renderer`的工作流程）分为三部分：

- before mutation阶段（执行`DOM`操作前）
- mutation阶段（执行`DOM`操作）
- layout阶段（执行`DOM`操作后）

## before mutation之前

该阶段首先调用useEffect等副作用，然后处理上一阶段的effectList，需要注意的是如果fiber根节点存在effectTag，则会将根节点插入到effectList的最末尾。最后根据不同情况设置`firstEffect`

```js
 // 将effectList赋值给firstEffect
  // 由于每个fiber的effectList只包含他的子孙节点
  // 所以根节点如果有effectTag则不会被包含进来
  // 所以这里将有effectTag的根节点插入到effectList尾部
  // 这样才能保证有effect的fiber都在effectList中
  let firstEffect;
  if (finishedWork.effectTag > PerformedWork) {
    if (finishedWork.lastEffect !== null) {
      finishedWork.lastEffect.nextEffect = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      firstEffect = finishedWork;
    }
  } else {
    // 根节点没有effectTag
    firstEffect = finishedWork.firstEffect;
  }
```

##  layout之后

主要包括三点内容：

1. `useEffect`相关的处理。

我们会在讲解`layout阶段`时讲解。

2. 性能追踪相关。

源码里有很多和`interaction`相关的变量。他们都和追踪`React`渲染时间、性能相关，在[Profiler API (opens new window)](https://zh-hans.reactjs.org/docs/profiler.html)和[DevTools (opens new window)](https://github.com/facebook/react-devtools/pull/1069)中使用。

> 你可以在这里看到[interaction的定义(opens new window)](https://gist.github.com/bvaughn/8de925562903afd2e7a12554adcdda16#overview)

3. 在`commit`阶段会触发一些生命周期钩子（如 `componentDidXXX`）和`hook`（如`useLayoutEffect`、`useEffect`）。

> 在这些回调方法中可能触发新的更新，新的更新会开启新的`render-commit`流程。

##  before mutation阶段(变更前)

该阶段主要进行以下处理

1. 处理`DOM节点`渲染/删除后的 `autoFocus`、`blur` 逻辑。

2. 调用`getSnapshotBeforeUpdate`生命周期钩子。

   > 从`React`v16开始，`componentWillXXX`钩子前增加了`UNSAFE_`前缀。
   >
   > 究其**原因**，是因为`Stack Reconciler`重构为`Fiber Reconciler`后，`render阶段`的任务**可能中断/重新开始**，对应的组件在`render阶段`的生命周期钩子（即`componentWillXXX`）可能**触发多次**。
   >
   > 这种行为和`React`v15不一致，所以标记为`UNSAFE_`。

3. 调度`useEffect`。

   调度一个异步函数，该函数最终会调用effects

   所以整个`useEffect`异步调用分为三步：

   1. `before mutation阶段`在`scheduleCallback`中调度`flushPassiveEffects`
   2. `layout阶段`之后将`effectList`赋值给`rootWithPendingPassiveEffects`
   3. `scheduleCallback`触发`flushPassiveEffects`，`flushPassiveEffects`内部遍历`rootWithPendingPassiveEffects`，并执行effects
   
   > 异步调用的目的是为了避免浏览器的渲染被阻塞

## mutation阶段（变更阶段）

`commitMutationEffects`会遍历`effectList`，对每个`Fiber节点`执行如下三个操作：

1. 根据`ContentReset effectTag`重置文字节点
2. 更新`ref`
3. 根据`effectTag`分别处理，其中`effectTag`包括(`Placement` | `Update` | `Deletion` | `Hydrating`)

- Placement effect

  标识需要插入该节点的DOM

- Update effectTag

  意味着该`Fiber节点`需要更新，需要重点关注函数组件更宿主组件的更新

  - FunctionComponent-函数组件更新会执行useLayoutEffect返回的销毁函数

    当`fiber.tag`为`FunctionComponent`，会调用`commitHookEffectListUnmount`。该方法会遍历`effectList`，执行所有`useLayoutEffect hook`的销毁函数。

  - HostComponent 变更

    当`fiber.tag`为`HostComponent`，会调用`commitUpdate`。更新属性到DOM上

    最终会在[`updateDOMProperties` (opens new window)](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-dom/src/client/ReactDOMComponent.js#L378)中将[`render阶段 completeWork` (opens new window)](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L229)中为`Fiber节点`赋值的`updateQueue`对应的内容渲染在页面上。

- Deletion effect

  当`Fiber节点`含有`Deletion effectTag`，意味着该`Fiber节点`对应的`DOM节点`需要从页面中删除。调用的方法为`commitDeletion`。

  1. 递归调用`Fiber节点`及其子孙`Fiber节点`中`fiber.tag`为`ClassComponent`的[`componentWillUnmount` (opens new window)](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L920)生命周期钩子，从页面移除`Fiber节点`对应`DOM节点`
  2. 解绑`ref`
  3. 调度`useEffect`的销毁函数

## 总结

该阶段依然是遍历effectList，并且根据effectTag进行不同的操作，该阶段会调度useEffect，并且调用useLayoutEffect以及useEffect的销毁函数，并且会针对DOM的属性进行更新

其中getSnapshotBeforeUpdate也是在该阶段进行调用。

> 总体上来说该阶段就是操作DOM，并且对变更DOM的属性，以及调用该阶段的生命周期函数

# layout阶段

与前两个阶段类似，`layout阶段`也是遍历`effectList`，执行函数。

具体执行的函数是`commitLayoutEffects`。

`commitLayoutEffects`一共做了两件事：

1. commitLayoutEffectOnFiber（调用`生命周期钩子`和`hook`相关操作）
2. commitAttachRef（赋值 ref）

##  commitLayoutEffectOnFiber

`commitLayoutEffectOnFiber`方法会根据`fiber.tag`对不同类型的节点分别处理。

> 你可以在[这里 (opens new window)](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L459)看到`commitLayoutEffectOnFiber`源码（`commitLayoutEffectOnFiber`为别名，方法原名为`commitLifeCycles`）

- 对于`ClassComponent`，他会通过`current === null?`区分是`mount`还是`update`，调用[`componentDidMount` (opens new window)](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L538)或[`componentDidUpdate` (opens new window)](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L592)。

- 触发`状态更新`的`this.setState`如果赋值了第二个参数`回调函数`，也会在此时调用。

  ```js
  this.setState({ xxx: 1 }, () => {
    console.log("i am update~");
  });
  ```

- 对于`FunctionComponent`及相关类型，他会调用`useLayoutEffect hook`的`回调函数`，调度`useEffect`的`销毁`与`回调`函数
- 对于`HostRoot`，即`rootFiber`，如果赋值了第三个参数`回调函数`，也会在此时调用。

```js
ReactDOM.render(<App />, document.querySelector("#root"), function() {
  console.log("i am mount~");
});
```

## commitAttachRef

`commitLayoutEffects`会做的第二件事是`commitAttachRef`。

> 获取DOM实例更新ref

##  current Fiber树切换

至此，整个`layout阶段`就结束了。

在结束本节的学习前，我们关注下这行代码：

```js
root.current = finishedWork;
```

在[双缓存机制一节](https://react.iamkasong.com/process/doubleBuffer.html#什么是-双缓存)我们介绍过，`workInProgress Fiber树`在`commit阶段`完成渲染后会变为`current Fiber树`。这行代码的作用就是切换`fiberRootNode`指向的`current Fiber树`。
