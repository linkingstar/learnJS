# JavaScript 事件

> JavaScript 是单线程的

## 同步任务以及异步任务

同步任务放在主线程中，异步任务放在任务队列中，只有当主线程任务全部执行完成之后，才会从任务对立中获取任务，并执行

![](http://www.ruanyifeng.com/blogimg/asset/2014/bg2014100801.jpg)

任务队列是事件机制，IO 设备完成任务之后，将在任务队列中添加一个事件。

任务队列中除开 IO 设备事件之外，还包含用户产生的事件`（鼠标事件，滚动事件）`，只要指定了`回调函数`，时间都会进入到任务队列，等待主线吃读取。

任务队列是 FIFO 的，主线程读取任务的过程完全自动，排在第一位的任务将最先读取（除开定时器任务）

## Event Loop

JS 事件循环可以参考下图

![](http://www.ruanyifeng.com/blogimg/asset/2014/bg2014100802.png)

> 任务队列中的任务总是在主线程任务执行完之后再执行

## 定时器

任务队列可以放置定时事件，指定代码在多少时间之后执行。

```js
console.log(1);
setTimeout(function () {
  console.log(2);
}, 1000);
console.log(3);
```

以上代码执行的结果是`1,3,2`。主线程先输出 1，3，然后等待 1000ms 之后输出 2

> 需要注意的是，setTimeout()只是将事件插入了"任务队列"，必须等到当前代码（执行栈）执行完，主线程才会去执行它指定的回调函数。要是当前代码耗时很长，有可能要等很久，所以并没有办法保证，回调函数一定会在 setTimeout()指定的时间执行。

## NodeJS 的 Event Loop

![](http://www.ruanyifeng.com/blogimg/asset/2014/bg2014100803.png)

> （1）V8 引擎解析 JavaScript 脚本。  
> （2）解析后的代码，调用 Node API。  
> （3）libuv 库负责 Node API 的执行。它将不同的任务分配给不同的线程，形成一个 Event Loop（事件循环），以异步的方式将任务的执行结果返回给 V8 引擎。  
> （4）V8 引擎再将结果返回给用户。
> NodeJS 提供了两个方法

### process.nextTick

`process.nextTick` 方法可以在当前"执行栈"的尾部----下一次 Event Loop（主线程读取"任务队列"）之前----触发回调函数

> 指定的任务总是发生在所有异步任务之前

### setImmediate

`setImmediate` 方法则是在当前"任务队列"的尾部添加事件，也就是说，它指定的任务总是在下一次 Event Loop 时执行，这与 `setTimeout(fn, 0)`很像。

# [总结](https://juejin.cn/post/6844903471280291854)

JavaScript 主线程拥有一个 **执行栈** 以及一个 **任务队列**，主线程会依次执行代码，当遇到函数时，会先将函数 入栈，函数运行完毕后再将该函数 出栈，直到所有代码执行完毕。  
那么遇到 WebAPI（例如：setTimeout, AJAX）这些函数时，这些函数会立即返回一个值，从而让主线程不会在此处阻塞。而真正的异步操作会由浏览器执行，浏览器会在这些任务完成后，将事先定义的回调函数推入主线程的 **任务队列** 中。  
而**主线程**则会在 清空当前执行栈后，按照先入先出的顺序读取任务队列里面的任务

- 异步任务是由浏览器执行的，不管是 AJAX 请求，还是 setTimeout 等 API，浏览器内核会在其它线程中执行这些操作，当操作完成后，将操作结果以及事先定义的回调函数放入 JavaScript 主线程的任务队列中
- JavaScript 主线程会在执行栈清空后，读取任务队列，读取到任务队列中的函数后，将该函数入栈，一直运行直到执行栈清空，再次去读取任务队列，不断循环
- 当主线程阻塞时，任务队列仍然是能够被推入任务的。这也就是为什么当页面的 JavaScript 进程阻塞时，我们触发的点击等事件，会在进程恢复后依次执行。

# Macrotasks 和 Microtasks

MacroTasks 和 MicroTasks 都属于异步任务。对应的 API 如下

- macrotasks: setTimeout, setInterval, setImmediate, I/O, UI rendering
- microtasks: process.nextTick, Promises, Object.observe(废弃), MutationObserver

Promise 为微任务，timeout 为宏任务。  
在每一次事件循环中，macrotask 只会提取一个执行，而 microtask 会一直提取，直到 microtasks 队列清空。

> 注：一般情况下，macrotask queues 我们会直接称为 task queues，只有 microtask queues 才会特别指明。

**那么也就是说如果我的某个 microtask 任务又推入了一个任务进入 microtasks 队列，那么在主线程完成该任务之后，仍然会继续运行 microtasks 任务直到任务队列耗尽。**

**而事件循环每次只会入栈一个 macrotask ，主线程执行完该任务后又会先检查 microtasks 队列并完成里面的所有任务后再执行 macrotask**

```js
setTimeout(() => {
  console.log(1);
}, 0);
let a = new Promise((resolve) => {
  console.log(2);
  resolve();
})
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(4);
  });
console.log(5);
```

输出为

```
2,5,3,4,1
```

```js
new Promise((resolve, reject) => {
  console.log('promise1');
  resolve();
})
  .then(() => {
    console.log('then11');
    new Promise((resolve, reject) => {
      console.log('promise2');
      resolve();
    })
      .then(() => {
        console.log('then21');
      })
      .then(() => {
        console.log('then23');
      });
  })
  .then(() => {
    console.log('then12');
  });
new Promise((resolve, reject) => {
  console.log('promise3');
  resolve();
}).then(() => {
  console.log('then31');
});
//promise1 promise3 then11 promise2 then31 then21  then12 then23
```
