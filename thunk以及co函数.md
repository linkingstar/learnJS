# 参考文档：http://www.ruanyifeng.com/blog/2015/05/co.html

# thunk 函数

thunk 将多参数带回调的函数，转换成单参数的函数，并返回一个接受 callback 的新函数。

```js
// 正常版本的readFile（多参数版本）
fs.readFile(fileName, callback);

// Thunk版本的readFile（单参数版本）
var readFileThunk = Thunk(fileName);
readFileThunk(callback);

var Thunk = function (fileName) {
  return function (callback) {
    return fs.readFile(fileName, callback);
  };
};
```

基于上方的逻辑。可以写出通用的 thunk 函数

```js
var Thunk = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return function (callback) {
      args.push(callback);
      return fn.apply(this, args);
    };
  };
};

var readFileThunk = Thunk(fs.readFile);
readFileThunk(fileA)(callback);
```

# Thunkify 模块

正式环境使用 Thunkify 模块来生成 thunk 函数，该函数的实现方式与上方类似

```js
function thunkify(fn) {
  return function () {
    var args = new Array(arguments.length);
    var ctx = this;

    for (var i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }

    return function (done) {
      var called;

      args.push(function () {
        if (called) return;
        called = true;
        done.apply(null, arguments);
      });

      try {
        fn.apply(ctx, args);
      } catch (err) {
        done(err);
      }
    };
  };
}
```

唯一的差别是使用了一个内置的变量 `called` 来避免重复调用回调函数

# co 函数

自动执行 next 函数，要求 yield 后面必须是 trunk 或者 Promise。

# async & await

- async 本身是 generator 的语法糖

```js
var gen = function* () {
  var f1 = yield readFile('/etc/fstab');
  var f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};

//如果使用async则如下
var asyncReadFile = async function () {
  var f1 = await readFile('/etc/fstab');
  var f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

## 优点

- 自带执行器，不再需要使用 co 库。
- 更好语义，相比 yield 看起来更舒服
- 更加通用：co 规定 yield 之后必须是 thunk 函数或者是 promise，await 之后可以跟上 promise 或者普通类型

## async 的实现原理

本质上是吧 generator 函数跟自动执行器都包装在一个函数里

```js
async function fn(args) {
  // ...
}

// 等同于

function fn(args) {
  // spawn为自动执行器，类似于co
  return spawn(function* () {
    // ...
  });
}

// spawn实现原理如下
function spawn(genF) {
  return new Promise(function (resolve, reject) {
    var gen = genF();
    function step(nextF) {
      try {
        var next = nextF();
      } catch (e) {
        return reject(e);
      }
      if (next.done) {
        return resolve(next.value);
      }
      Promise.resolve(next.value).then(
        function (v) {
          step(function () {
            return gen.next(v);
          });
        },
        function (e) {
          step(function () {
            return gen.throw(e);
          });
        },
      );
    }
    step(function () {
      return gen.next(undefined);
    });
  });
}
```

## 需要注意的地方

await 调用的函数可能会调用 reject，因此最好使用 try...catch 包裹，或者直接使用.catch 方法

```js
async function myFunction() {
  try {
    await somethingThatReturnsAPromise();
  } catch (err) {
    console.log(err);
  }
}

// 另一种写法

async function myFunction() {
  await somethingThatReturnsAPromise().catch(function (err) {
    console.log(err);
  });
}
```

> generator 本质上是 js 的协程，允许从一个某个函数暂停，然后在某个时刻恢复
