# 概述
尽管JS是单线程的，但是event loop允许Node.JS执行非阻塞的IO操作
> 原理是是尽可能将非阻塞的操作交给系统内核处理


由于现在流行的内核都是多线程的，所以可以在后台同时执行多个任务。当某个任务完成之后，内核会通知NodeJS并将对应的callback放入`pool queue`,并最终执行放入队列的回调。

# Event Loop
当NodeJS启动之后，会初始化一个事件循环，并处理输入的script——其中可能包含异步请求，timer调度，或者`process.nextTick()`函数调用等，然后开始处理事件循环。

事件循环的处理顺序可以参考下方的表格
```js
   ┌───────────────────────────┐
┌─>│           timers          │ //timer调度
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ //callback被挂起
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ //空闲，准备阶段
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │ //内核处理完毕之后，将callback放入pool queue
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │ //检查
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │ //结束回调
   └───────────────────────────┘
```

上图中的每一个box都是一个独立的阶段，每个阶段都有一个FIFO的callback队列，通常当事件循环进入到某个阶段，首先会执行当前阶段的所有操作(operations)，然后执行当前阶段队列里面的callback，直到所有的callback都被执行或者达到callback执行数量的最大上限为止，然后将进入到下一阶段。

# 各阶段概述
- timers: 执行setTimeOut，setInterval调度的callback
- pending callback：执行延迟到下一次循环迭代的 **I/O 回调**，主要是操作系统的回调
- idle, prepare: 空闲准备阶段只用于内部使用
- poll(轮询）：获取新的IO事件，并且执行IO相关的callback（执行除开close callback，timers调度的callback，setImmediate之外的所有callback），node可能在合适的时机被阻塞
- check :调用setImmediate() callbacks 
- close：调用跟close相关的callback（例如: socket.on('close', ...))

在事件循环执行每次运行之间，NodeJS都会检查是否有异步IO或者timers请求，如果不存在，则直接关闭

# 详细说明

## timers callback

> A timer specifies the **threshold** *after which* a provided callback *may be executed* rather than the **exact** time a person *wants it to be executed*.

timer实际上是指定了执行callback的等待阈值，而不是具体的等待时间。timers会尽早的在指定的时间过去之后被执行，但是操作系统的调度或执行其他的回调任务会导致timers的延后执行

> 从技术实现上来讲，timers会在poll阶段被执行

举例说明一下，参考以下代码

```js
const fs = require('fs');

function someAsyncOperation(callback) {
  // Assume this takes 95ms to complete
  fs.readFile('/path/to/file', callback);
}

const timeoutScheduled = Date.now();

setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;

  console.log(`${delay}ms have passed since I was scheduled`);
}, 100);

// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(() => {
  const startCallback = Date.now();

  // do something that will take 10ms...
  while (Date.now() - startCallback < 10) {
    // do nothing
  }
});
```

代码中设置了一个timer，在100ms之后触发，当事件循环进入轮询阶段时，它有一个空队列（fs.readFile() 还没有完成），所以它会等待剩余的毫秒数，直到达到最快的计时器阈值。 在等待 95 毫秒传递时， fs.readFile() 完成读取文件，并将其需要 10 毫秒完成的回调添加到轮询队列并执行。 当回调完成时，队列中不再有回调，因此事件循环将看到已达到最快计时器的阈值，然后返回到 timers 阶段以执行计时器的回调。 在此示例中，您将看到调度计时器与其回调执行之间的总延迟为 105 毫秒。

> 为了避免poll阶段事件循环空转（一直等待），libuv设置了一个最大等待时间

## 挂起的回调

该阶段主要执行系统的一些回调，比如TCP网路请求抛出的错误等。

比如TCP socket在建立连接的时候接收到了ECONNREFUSED错误，一些类Linux系统等待抛出这些错误。那么这些错误回调就会被放入队列并执行。

## poll 轮询阶段

poll阶段包含两个主要功能

- 计算poll IO需要多长时间，并且
- 处理在poll队列中的事件

当事件循环进入poll阶段，并且当前没有timer被安排调度，分为两种情况

- 如果poll队列不为空，那么就会遍历队列中的回调并同步执行，直到处理完所有callback或者达到callback执行的上限为止

- 如果poll队列为空，又分为两种情况

  - 如果存在被`setImmediate`调度的callback，那么将直接结束poll阶段，进入下一阶段(check)处理被调度的callback

  - 如果不存在`setImmediate`调度的callback，那么事件循环会继续等待callback进入队列，并立即执行。

当poll队列为空，事件循环将检查timers调度的callback是否满足了调度条件，如果一个或者多个timers已经达到调度条件，**事件循环将重新回到timers阶段处理事件回调**。

## check阶段

当poll阶段完成执行之后，就会进入到该阶段。当poll阶段变得空闲，并且有被setImmediate调度的脚本，那么事件循环会在该阶段继续。

## close callback

如果一个socket连接被意外的关闭，那么close event将在该阶段发送。否则将有process.nextTick()发送。

##  `setImmediate()` vs `setTimeout()`

这两个函数比较类似，但是区别在于他们调用方式

- setImmediate调度的callback会在当前poll执行完毕之后执行
- setTimeout 则是在超过阈值毫秒数的最早时间进行执行

二者的执行先后顺序取决于二者执行的上下文：

- 如果在非IO循环的主线程里面执行，那么只取决于当前进程的性能，并且无法确定执行的先后顺序

  ```js
  // timeout_vs_immediate.js
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  
  setImmediate(() => {
    console.log('immediate');
  });
  
  ```

  ```
  $ node timeout_vs_immediate.js
  timeout
  immediate
  
  $ node timeout_vs_immediate.js
  immediate
  timeout
  ```

- 如果在IO循环的回调中执行，那么setImmediate总会先于setTimeout

  ```js
  // timeout_vs_immediate.js
  const fs = require('fs');
  
  fs.readFile(__filename, () => {
    setTimeout(() => {
      console.log('timeout');
    }, 0);
    setImmediate(() => {
      console.log('immediate');
    });
  });
  ```

  ```
  $ node timeout_vs_immediate.js
  immediate
  timeout
  
  $ node timeout_vs_immediate.js
  immediate
  timeout
  ```

## process.nextTick()

通过上面的讨论可以发现，图表中并没有出现nextTick的影子，主要原因是该函数并不属于事件循环的技术范畴。相反的，存在一个nextTickQueue队列，无论处于事件循环的哪个阶段，在当前阶段结束之后，nextTickQueue中的事件都将会被处理。

也就是说无论你在什么时候调用nextTick，在事件循环进入到下一个阶段之前，都会先执行nextTick调度的内容。

> 因此nextTick可能会产生严重的问题，如果递归调用了nextTick，会导致事件循环停滞在当前阶段，无法流转到poll阶段。

### nextTick的设计动机

举个例子，apiCall对参数进行了检查，如果参数不为string，则生成错误信息传递给callback。

```js
function apiCall(arg, callback) {
  if (typeof arg !== 'string')
    return process.nextTick(callback,
                            new TypeError('argument should be string'));
}
```

而callback的执行时机是在**执行完所有用户代码之后**，**且进入事件循环之前**

考虑以下场景：我们定义了一个看似异步的方法`someAsyncApiCall`，但是在方法中直接同步调用了callback(),在callback中直接输出了bar的信息。但是由于someAsyncApiCall在执行的时候，后续的代码还没有运行（bar还未被初始化），那么导致输出的bar值就存在问题。

```js
let bar;

// this has an asynchronous signature, but calls callback synchronously
function someAsyncApiCall(callback) { callback(); }

// the callback is called before `someAsyncApiCall` completes.
someAsyncApiCall(() => {
  // since someAsyncApiCall hasn't completed, bar hasn't been assigned any value
  console.log('bar', bar); // undefined
});

bar = 1;
```

如果我们将callback用nextTick包裹，就能解决这个问题

```js
let bar;

function someAsyncApiCall(callback) {
  process.nextTick(callback);
}

someAsyncApiCall(() => {
  console.log('bar', bar); // 1
});

bar = 1;
```

` process.nextTick`保证在执行完其他用户代码之后，再执行callback；与此同时还能暂停event loop往下一阶段流转。

## 为什么使用nextTick

这里有两个主要原因：

1. 允许用户在callback中进行错误处理，并对不需要的资源进行释放；或者在事件循环之前再发起一次请求
2. 当需要在调用栈展开之后、进入事件循环之前调用callback时。

> 详见[Why use `process.nextTick()`](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#why-use-process-nexttick)

# 参考文档

https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#why-use-process-nexttick
