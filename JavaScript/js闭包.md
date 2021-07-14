# 概述

js闭包中的自由变量的值，只与定义的时的值有关。

# demo1

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}

var foo = checkscope();
foo();
// "local scope"
```

# demo2



```js
var data = [];

for (var i = 0; i < 3; i++) {
  data[i] = function () {
    console.log(i);
  };
}

data[0]();
data[1]();
data[2]();
//VM1812:5 3
//VM1812:5 3
//VM1812:5 3

//如果把var改成let，就能输出0，1，2
//输出3的原因var会将变量提升到顶部，所以所有函数共用一个i，且都为3
```



```js
var data = [];
for (var i = 0; i < 3; i++) {
  data[i] = (function (i) {
       return function(){
            console.log(i);
        }
  })(i);
}

data[0]();
data[1]();
data[2]();

// VM1614:6 0
// VM1614:6 1
// VM1614:6 2

```

```js

for (var i = 0; i < 3; i++) {
(function () {
			    //var ii = i;
          console.log(i);     
  })();
}
// 0 1 2

```

```js
var data = [];
for (var i = 0; i < 3; i++) {
  data[i] = (function () {
    		var t = i;
       return function(){
            console.log(t);
        }
  })();
}

data[0]();
data[1]();
data[2]();
// 0 1 2
```

