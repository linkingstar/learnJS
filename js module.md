# JS Module

ES6 之前制定了两种模块加载方案，CommonJS 和 AMD，前者一般用于服务器，后者一般用于浏览器。ES6 之后出现 ES6 模块，可以完全取代前两种模块

- ES6 模块静态化，在编译时可以确定依赖关系。
- CommonJS 以及 AMD 需要在运行时才能确定。

# 严格模式

ES6 自动使用严格模式，无论你是否在文件加上'use strict'

# export

ES6 export 可以使用以下几种方式

```js
// 写法一
export var m = 1;

// 写法二
var m = 1;
export { m };

// 写法三 export as
var n = 1;
export { n as m };
```

ES6 与 CommonJS 不同之处在于，ES6 导出的值，是可以更新的，

```js
export var foo = 'bar';
setTimeout(() => (foo = 'baz'), 500);
```

以上代码输出的 foo，会随着时间的推移从 bar 变成 baz,CommonJS export 的变量存在缓存，并且不会更新。

# import

import 输入的变量是只读的，改写导入的变量会导致错误，但是如果导入的是一个对象，那么改写对象内部的属性是可以的，例如

```js
import { a } from './xxx.js';

a = {}; // Syntax Error : 'a' is read-only;

a.foo = 'hello'; // 合法操作
```

> 上面代码中，a 的属性可以成功改写，**并且其他模块也可以读到改写后的值**

注意，import 命令具有提升效果，会提升到整个模块的头部，首先执行。

```js
foo();

import { foo } from 'my_module';
```

# 模块整体加载

```js
import * as Utils from 'utils';
Utils.foo();
Utils.bar();
```

# import()动态加载

```js
const main = document.querySelector('main');

import(`./section-modules/${someVariable}.js`)
  .then((module) => {
    module.loadPageInto(main);
  })
  .catch((err) => {
    main.textContent = err.message;
  });
```

import()函数会返回一个 promise，使用该函数在运行时加载对应的模块，使用该函数可以实现按需加载，或者 lazy loading，并且也能实现按照条件加载
