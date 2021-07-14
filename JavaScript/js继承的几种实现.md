# 基于原型继承

兼容性最高的继承方式，唯一的问题是所有实例会共用引用类型的属性

```js
function foo(){}
foo.prototype = {
  foo_prop: "foo val"
};
function bar(){}
proto.bar_prop = "bar val";
bar.prototype = new foo;
var inst = new bar;
console.log(inst.foo_prop);
console.log(inst.bar_prop);
```

参考下面的demo

```js
function Parent () {
    this.names = ['kevin', 'daisy'];
}

function Child () {

}

Child.prototype = new Parent();

var child1 = new Child();

child1.names.push('yayu');

console.log(child1.names); // ["kevin", "daisy", "yayu"]

var child2 = new Child();

console.log(child2.names); // ["kevin", "daisy", "yayu"]
//VM914:15 (3) ["kevin", "daisy", "yayu"]
//VM914:19 (3) ["kevin", "daisy", "yayu"]
```

# 借用父类的构造函数

```js
function Parent () {
    this.names = ['kevin', 'daisy'];
}

function Child () {
    Parent.call(this);
}

var child1 = new Child();

child1.names.push('yayu');

console.log(child1.names); // ["kevin", "daisy", "yayu"]

var child2 = new Child();

console.log(child2.names); // ["kevin", "daisy"]
```

# 组合继承（原型继承+构造函数继承）

融合原型链继承和构造函数的优点，是 JavaScript 中最常用的继承模式。

```js
function Parent (name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.getName = function () {
    console.log(this.name)
}

function Child (name, age) {

    Parent.call(this, name);
    
    this.age = age;

}
//更新原型链
Child.prototype = new Parent();
//更新构造函数
Child.prototype.constructor = Child;
```

demo

```js

var child1 = new Child('kevin', '18');

child1.colors.push('black');

console.log(child1.name); // kevin
console.log(child1.age); // 18
console.log(child1.colors); // ["red", "blue", "green", "black"]

var child2 = new Child('daisy', '20');

console.log(child2.name); // daisy
console.log(child2.age); // 20
console.log(child2.colors); // ["red", "blue", "green"]
```

