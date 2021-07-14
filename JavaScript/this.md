# this

非严格模式下，this 指向 globalThis，严格模式下，未设置 this 的情况下，this 为 undefined

# class this

在类的构造方法中，类的所有非静态属性都会绑定到 this 上

# 派生类（子类）

子类中默认不会绑定 this，除非调用了 super 方法，super 方法会绑定父类的属性。

子类不能在调用`super()`方法之前返回，除非它返回别的对象，或者不定义构造函数

```js
class Base {}
class Good extends Base {}
class AlsoGood extends Base {
  constructor() {
    return { a: 5 };
  }
}
class Bad extends Base {
  constructor() {}
}

new Good();
new AlsoGood();
new Bad(); // ReferenceError
```

# 函数中的 this

```js
// 对象可以作为 bind 或 apply 的第一个参数传递，并且该参数将绑定到该对象。
var obj = { a: 'Custom' };

// 声明一个变量，并将该变量作为全局对象 window 的属性。
var a = 'Global';

function whatsThis() {
  return this.a; // this 的值取决于函数被调用的方式
}

whatsThis(); // 'Global' 因为在这个函数中 this 没有被设定，所以它默认为 全局/ window 对象
whatsThis.call(obj); // 'Custom' 因为函数中的 this 被设置为obj
whatsThis.apply(obj); // 'Custom' 因为函数中的 this 被设置为obj
```

# this 和对象转换

```js
function add(c, d) {
  return this.a + this.b + c + d;
}

var o = { a: 1, b: 3 };

// 第一个参数是用作“this”的对象
// 其余参数用作函数的参数
add.call(o, 5, 7); // 16

// 第一个参数是用作“this”的对象
// 第二个参数是一个数组，数组中的两个成员用作函数参数
add.apply(o, [10, 20]); // 34
```

非严格模式下，`call`以及`apply`会将第一个参数转换成对象
比如

> - 7 -> Number(7)
> - "foo" -> String("foo")
> - undefined -> globalObject

# bind

```js
function f() {
  return this.a;
}

var g = f.bind({ a: 'azerty' });
console.log(g()); // azerty

var x = f.bind({ a: 'zzzzz' });
console.log(x()); // zzzz

var h = g.bind({ a: 'yoo' }); // bind只生效一次！
console.log(h()); // azerty

var o = { a: 37, f: f, g: g, h: h };
console.log(o.a, o.f(), o.g(), o.h()); // 37, 37, azerty, azerty
```

- bind 会永久的将 this 指向传入的参数
- 已经 bind 过一次的函数，再次绑定将不会生效
- 在对象内部将自动 bind 该对象

# 箭头函数

在箭头函数中，this 与封闭词法环境的 this 保持一致。在全局代码中，它将被设置为全局对象

```js
var globalObject = this;
var foo = () => this;
console.log(foo() === globalObject); // true
```

> 注意：如果将 this 传递给 call、bind、或者 apply 来调用箭头函数，它将被忽略。不过你仍然可以为调用添加参数，不过第一个参数（thisArg）应该设置为 null。

```js
// 接着上面的代码
// 作为对象的一个方法调用
var obj = { foo: foo };
console.log(obj.foo() === globalObject); // true

// 尝试使用call来设定this
console.log(foo.call(obj) === globalObject); // true

// 尝试使用bind来设定this
foo = foo.bind(obj);
console.log(foo() === globalObject); // true
```

无论如何，foo 的 this 被设置为他被创建时的环境

```js
// 创建一个含有bar方法的obj对象，
// bar返回一个函数，
// 这个函数返回this，
// 这个返回的函数是以箭头函数创建的，
// 所以它的this被永久绑定到了它外层函数的this。
// bar的值可以在调用中设置，这反过来又设置了返回函数的值。
var obj = {
  bar: function () {
    var x = () => this;
    return x;
  },
};

// 作为obj对象的一个方法来调用bar，把它的this绑定到obj。
// 将返回的函数的引用赋值给fn。
var fn = obj.bar();

// 直接调用fn而不设置this，
// 通常(即不使用箭头函数的情况)默认为全局对象
// 若在严格模式则为undefined
console.log(fn() === obj); // true

// 但是注意，如果你只是引用obj的方法，
// 而没有调用它
var fn2 = obj.bar;
// 那么调用箭头函数后，this指向window，因为它从 bar 继承了this。
console.log(fn2()() == window); // true
```

# 在对象的方法中调用

> **当函数作为对象里的方法被调用时，this 被设置为调用该函数的对象。**

```js
var o = {
  prop: 37,
  f: function () {
    return this.prop;
  },
};

console.log(o.f()); // 37
```

我们设置可以先定义函数，然后再绑定到对象上

```js
var o = { prop: 37 };

function independent() {
  return this.prop;
}

o.f = independent;

console.log(o.f()); // 37
```

> **同样，this 的绑定只受最接近的`成员引用`的影响。**

```js
// 接上方的代码
o.b = { g: independent, prop: 42 };
console.log(o.b.g()); // 42
```

# 原型链(Prototype)中的 this

对于在对象原型链上某处定义的方法，同样的概念也适用。如果该方法存在于一个对象的原型链上，那么 this 指向的是调用这个方法的对象，就像该方法就在这个对象上一样。

```js
var o = {
  f: function () {
    return this.a + this.b;
  },
};
var p = Object.create(o);
p.a = 1;
p.b = 4;

console.log(p.f()); // 5
```

在这个例子中，对象 p 没有属于它自己的 f 属性，它的 f 属性继承自它的原型。虽然最终是在 o 中找到 f 属性的，这并没有关系；查找过程首先从 p.f 的引用开始，所以函数中的 this 指向 p。也就是说，因为 f 是作为 p 的方法调用的，所以它的 this 指向了 p。这是 JavaScript 的原型继承中的一个有趣的特性。

# 作为构造函数

当一个函数用作构造函数时（使用 new 关键字），它的 this 被绑定到正在构造的新对象。

```js
/*
 * 构造函数这样工作:
 *
 * function MyConstructor(){
 *   // 函数实体写在这里
 *   // 根据需要在this上创建属性，然后赋值给它们，比如：
 *   this.fum = "nom";
 *   // 等等...
 *
 *   // 如果函数具有返回对象的return语句，
 *   // 则该对象将是 new 表达式的结果。
 *   // 否则，表达式的结果是当前绑定到 this 的对象。
 *   //（即通常看到的常见情况）。
 * }
 */

function C() {
  this.a = 37;
}

var o = new C();
console.log(o.a); // logs 37

function C2() {
  this.a = 37;
  return { a: 38 };
}

o = new C2();
console.log(o.a); // logs 38
```

# 作为一个 DOM 事件处理函数

当函数被用作事件处理函数时，它的 this 指向触发事件的元素（一些浏览器在使用非 addEventListener 的函数动态地添加监听函数时不遵守这个约定）。

```js
// 被调用时，将关联的元素变成蓝色
function bluify(e) {
  console.log(this === e.currentTarget); // 总是 true

  // 当 currentTarget 和 target 是同一个对象时为 true
  console.log(this === e.target);
  this.style.backgroundColor = '#A5D9F3';
}

// 获取文档中的所有元素的列表
var elements = document.getElementsByTagName('*');

// 将bluify作为元素的点击监听函数，当元素被点击时，就会变成蓝色
for (var i = 0; i < elements.length; i++) {
  elements[i].addEventListener('click', bluify, false);
}
```

# 类中的 this

和其他普通函数一样，方法中的 this 值取决于它们如何被调用。有时，改写这个行为，让类中的 this 值总是指向这个类实例会很有用。为了做到这一点，可在构造函数中绑定类方法：

```js
class Car {
  constructor() {
    // Bind sayBye but not sayHi to show the difference
    this.sayBye = this.sayBye.bind(this);
  }
  sayHi() {
    console.log(`Hello from ${this.name}`);
  }
  sayBye() {
    console.log(`Bye from ${this.name}`);
  }
  get name() {
    return 'Ferrari';
  }
}

class Bird {
  get name() {
    return 'Tweety';
  }
}

const car = new Car();
const bird = new Bird();

// The value of 'this' in methods depends on their caller
car.sayHi(); // Hello from Ferrari
bird.sayHi = car.sayHi;
bird.sayHi(); // Hello from Tweety

// For bound methods, 'this' doesn't depend on the caller
bird.sayBye = car.sayBye;
bird.sayBye(); // Bye from Ferrari
```

# 总结
- 如果在全局作用域调用函数，非严格模式下this指向`globalThis`或者`window`，严格模式下为`undefined`

- 如果采用obj.fun()的形式调用，this指向obj

- 如果将fun()应用到构造函数`let obj = new fun()`，那么this指向被构造的obj

- 如果使用bind,apply,call等函数调用fun，那么指向传入的obj

- 如果使用箭头函数，this依赖于函数定义的上下文，并且不能被更改

- 如果采用在表达式中调用fun，那么会丢失this绑定(与全局模式类似)，参见以下demo

  ```js
  let a = {
    fun:function(){console.log(this.prop)},
    prop:1,
  }
  a.fun();
  //output 1
  let fun;
  (fun = a.fun)()
  //output undefine
  ```

  