# 概述

React Native属于react-render这一层，主要用来在移动端生成原生组件

RN的技术框架如下

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c0372c7df58e4b6584cae190862611a1~tplv-k3u1fbpfcp-zoom-1.image)

## JavaScript引擎

> 现在RN默认的JS引擎为**JavaScriptCore**，不过现在最新的是**Hermes**。

`JS引擎`用于解析跟执行js代码，每个RN应用都有一个js bundle文件，那么引擎就负责解析跟执行这个bundle文件

## JS Bridge

在RN中，原生代码与JS代码通过JS Bridge进行相互调用。

**Bridge 的作用就是给 React Native 内嵌的 JS Engine 提供原生接口的扩展供 JS 调用**。所有的本地存储、图片资源访问、图形图像绘制、3D 加速、网络访问、震动效果、NFC、原生控件绘制、地图、定位、通知等都是通过 Bridge 封装成 JS 接口以后注入 JS Engine 供 JS 调用。理论上，任何原生代码能实现的效果都可以通过 Bridge 封装成 JS 可以调用的组件和方法, 以 JS 模块的形式提供给 RN 使用。

同时原生端也可以通过JS Bridge调用JS 函数

# 总结

ReactNative就是通过js 引擎解析并运行bundle文件，js与原生之前通过JSBridge进行相互调用以及数据互通，最终完成整个app的运行。

# 参考文档

https://juejin.cn/post/6916452544956858382





