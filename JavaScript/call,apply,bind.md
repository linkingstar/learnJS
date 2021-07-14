如何自定义呢

## 自定义call

```js
Function.prototype.MyCall = function (context) {
  
  const args = [...arguments].slice(1);
  //context为指定的this,可能不存在
  if(!context){
    return this(...args);
  }
  //this就是当前函数
  context.fn = this;

  const result = context.fn(...args);
  delete context.fn;

  return result;
}
```

## 自定义 apply

```js
Function.prototype.MyApply = function (context) {

  const args = arguments[1]||[];
  //context为指定的this,可能不存在
  if(!context){
    return this(...args);
  }
  //this就是当前函数
  context.fn = this;

  const result = context.fn(...args);
  delete context.fn;

  return result;
}
```

## 自定义bind

```js
Function.prototype.MyBind = function (context) {
  const args = [...arguments].slice(1);
  var self = this;
  
  return function () {
   self.MyApply(context, args);
  }
}
```



