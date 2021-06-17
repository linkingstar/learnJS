# web worker

web worker 允许使用一个单独的线程来执行耗时的任务，这样就不会导致主线程变慢或者被阻塞。

# web worker 的概念以及用法

单个 worker 通过 worker 的构造函数传入一个 js 文件创建，该文件包含在 worker 线程中运行的代码。

在 worker thread 中你可以运行大部分 js 提供的函数集。但是也存在一些例外：

- 你不能在 worker 中更新 DOM
- 你不能使用 window 上的一些默认方法跟属性

worker 线程跟主线程之前通过系统消息进行数据通信。双方都通过调用 postMessage()方法，并通过注册 onMessage 方法的回调来处理事件。数据是直接复制而不是共享。

workers 可以另外产生新的 worker，只要这些 worker 跟父页面寄宿在同一个来源，另外 worker 可以通过 XMLHTTPRequest 访问网络。

# worker 类型

- 专用 worker
  被单个脚本所使用的 worker 即为专用 worker，`DedicatedWorkerGlobalScope`的任一对象都代表着专用 worker
- 共享 worker
  共享 worker 被运行在不同窗口下的多个脚本所使用。例如，在同一域名下的多个 iframes 中的 workers。共享 worker 要比专用 worker 复杂，因为它们要通过不同的端口进行通信
- Service Workers
  服务 workers 是位于 web 应用，浏览器以及服务器之间的代理服务。  
  它们旨在创建有效的离线体验、拦截网络请求并根据网络是否可用采取适当的行动，以及更新驻留在服务器上的资源。 他们还将允许访问推送通知以及在后台同步服务器 API。

# worker 全局上下文以及函数

worker 运行在不同于 window 的全局上下文。由于 window 在 works 中不可用，因此大部分的方法被定义在公共的 mixin，并通过他们自己从`WorkerGlobalScope`派生的上下文中访问。

- `DedicatedWorkerGlobalScope` for dedicated workers
- `SharedWorkerGlobalScope` for shared workers
- `ServiceWorkerGlobalScope` for service workers

还有一小部分的函数是跟主线程保持一致的（来自于 `WindowOrWorkerGlobalScope`）：

> atob(), btoa(), clearInterval(), clearTimeout(),dump() , setInterval(), setTimeout().

下面的函数是 works 独有的

- WorkerGlobalScope.importScripts() (all workers),
- close() (dedicated and shared workers only),
- DedicatedWorkerGlobalScope.postMessage (dedicated workers and only).

> 参考文档 https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API

> 如何使用 https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
