# 概述

函数柯里化是指将多个参数的函数调用变成一系列单参数的函数调用。例如将`sum(a,b,c,d)`变成`sum(a)(b)(c)(d)`

举个最简单的例子

```js
function curry(f) { // curry(f) 执行柯里化转换
  return function(a) {
    return function(b) {
      return f(a, b);
    };
  };
}

// 用法
function sum(a, b) {
  return a + b;
}

let curriedSum = curry(sum);

alert( curriedSum(1)(2) ); // 3
```

# 柯里化的目的

- 最直观的就是简化函数调用
- 被柯里化之后的函数可以持有默认参数，生成一个新函数。

# 高级柯里化

```js
function curry(func) {

  return function curried(...args) {
    var self = this;
    //判断传入参数的长度跟函数定义的参数长度，如果大于定义长度则直接调用该函数
    if (args.length >= func.length) {
      return func.apply(self, args);
    } else {
      //或者就递归调用柯里化函数，并合并两次的参数
      return function(...args2) {
        return curried.apply(self, args.concat(args2));
      }
    }
  };

}
```





