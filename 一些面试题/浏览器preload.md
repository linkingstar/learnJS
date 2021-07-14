# preload prefetch

- prefetch 利用浏览器空闲时间加载资源

  ```html
  <link href="/js/xx.js" rel="prefetch">
  ```

- Preload 需要通过as指定资源类型，在页面渲染之前，预先加载资源

  ```html
  <link href="/js/xxx.js" rel="preload" as="script"> 
  ```
  
  - type 指定MIME type
  
  - crossorigin 指定跨域，例如anonymous指定匿名跨域

# async 和 defer 的区别

`async` : 加载脚本和渲染后续文档元素并行进行，脚本加载完成后，暂停html解析，立即解析js脚本

`defer` : 加载脚本和渲染后续文档元素并行进行，但**脚本的执行会等到 html 解析完成后执行**