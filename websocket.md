# 目的

websocket 是为了解决类似于轮休这种问题而产生的，由于 HTTP 协议都需要客服端发起，不能由服务器实时更新数据，而 WS 在建立连接之后，可以允许服务器直接向客户端推送数据

# 简介

WS 同时允许服务器跟客户端互相发送数据，属于服务器推送技术的一种，具有以下特点

- 建立在 tcp 协议之上
- 与 http 协议兼容，默认端口也是 80 跟 443
- 数据格式轻量，性能开销小，通信高效
- 可以发送文本，以及二进制
- 没有跨域等限制
- 协议的标识为 ws,加密这是 wss
  ```js
  ws://example.com:80/some/path
  ```
  ![](http://www.ruanyifeng.com/blogimg/asset/2017/bg2017051503.jpg)

# demo

```js
var ws = new WebSocket('wss://echo.websocket.org');

ws.onopen = function (evt) {
  console.log('Connection open ...');
  ws.send('Hello WebSockets!');
};

ws.onmessage = function (evt) {
  console.log('Received Message: ' + evt.data);
  ws.close();
};

ws.onclose = function (evt) {
  console.log('Connection closed.');
};
```

# [参考文档](http://www.ruanyifeng.com/blog/2017/05/websocket.html)
