# 概述

JS大部分内存泄漏都是因为某个对象或者dom被全局的变量所持有，除此之外就是timers未被释放以及事件绑定的回调未被remove

> 注意：console.log持有的对象也不会被释放

事件绑定主要指执行了window.addEvenetListener而没有执行removeEventListener

参考文档：https://zhuanlan.zhihu.com/p/60538328

