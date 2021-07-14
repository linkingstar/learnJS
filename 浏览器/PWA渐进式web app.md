# PWA的优点

既是网页，又是app，同时具有webapp跟原生app的优点

通常说PWA都是基于Service Worker的，至于其他功能，像是[推送通知](https://developer.mozilla.org/docs/Web/API/Push_API)、[通知功能](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)和[添加至主屏](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen)功能也得到了广泛的支持。 目前，Safari 对 [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) 和 [添加指主屏](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen)的支持有限，并且不支持 Web 推送通知。 但是，其他主流浏览器都支持这里的所有功能。

# PWA 结构

## [应用架构](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps/App_structure#应用架构)

渲染网站主要有两种方法 - 在服务器上或在客户端上。它们都有其优点和缺点，你可以适当地混合使用这两种方法

- 服务器端渲染（SSR）的意思是在服务器上渲染网页，**因此首次加载会更快**，但是在不同页面之间导航都**需要下载新的**HTML内容。它的跨浏览器兼容性良好，但代价是页间加载时间延长，也就是总体感知上的性能降低：每加载一个页面，都需要一个服务器请求往返的时间。
- 客户端渲染（CSR）允许在导航到不同页面时几乎立即在浏览器中更新网站，**但在开始时需要更多的初始下载和客户端上的额外渲染。 首次访问时网站速度较慢，**但后续访问速度要快得多。

将 SSR 与 CSR 混用可以获得最佳效果：您可以在服务器上渲染网站，缓存其内容，然后在客户端需要时更新渲染。因为使用了 SSR，第一页加载很快；因为客户端可以仅使用已更改的部分重新渲染页面，所以页面之间的导航也是平滑的。

您可以按自己喜欢的方式构建 PWA，但有些方式更合适。最流行的是“App Shell”概念，它完全按照上述方式混用 SSR 和 CSR；此外还遵循“离线优先”方法。

## [App Shell 概念](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps/App_structure#app_shell_概念)

App Shell 概念试图尽快加载最小用户界面，然后缓存它，以便在后续访问时可以离线使用，然后再加载应用程序的所有内容。这样，下次有人从设备访问应用程序时，UI 立即从缓存加载；如果缓存数据不可用的话，就从服务器请求新内容。

我们可以通过 [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) 控制从服务器请求的内容以及从缓存中检索的内容

### [可链接、渐进式和响应式](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps/App_structure#可链接、渐进式和响应式)

记住 PWA 的优点并在设计应用程序时牢记这一点非常重要。 app shell 方案允许网站：

- 可链接（Linkable）：即使行为类似于原生应用，它仍然是一个网站：您可以点击页面内的链接，也可以通过发送 URL 的方式分享网站给别人。
- 渐进式（Progressive）：从“美好的旧式基础网站”开始，逐步添加新功能，在过程中检测其在浏览器上的可用性，并且优雅地处理不支持案例下发生的报错。举个例子，service workers 辅助下的离线模式只是提升网站体验的额外特性，但没有它网站也仍然完全可用。
- 响应式（Responsive）：响应式网页设计也适用于渐进式网络应用程序，因为它们都主要用于移动设备。拥有浏览器的设备太多太杂，所以确保网站在不同屏幕宽度、视口和像素密度上都可以访问就变得尤为重要。[viewport meta tag](https://developer.mozilla.org/en-US/docs/Mozilla/Mobile/Viewport_meta_tag)、[CSS media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries)、[Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout) 和 [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) 等技术都可以助您实现这个目标。

## [另一种概念：流](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps/App_structure#另一种概念：流)

使用 [Streams API](https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API) 可以实现完全不同的服务器端或客户端渲染方法。在 service worker 的帮助下，它可以极大改进内容解析的方式。

# 总结

基于Service Worker，CacheStorage等实现的类似于原生app的应用，server worker一经注册就可以一直使用，除非手动调用了unregister，可以针对fetch函数设置代理，决定从缓存或者服务器获取数据，同时还能给用户发送通知，或者监听服务器发起的推送消息。

