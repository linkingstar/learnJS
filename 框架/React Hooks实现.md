# useState实现

useState内部使用一个数组进行存储（包括当前的state value，以及setStateValue函数），并且有一个下标用来定位当前的state，每次render的开始，当前的下标都会重置为0，useState的代码逻辑类似于[以下的实现](https://juejin.cn/post/6844903975838285838)

```js
import React from "react";
import ReactDOM from "react-dom";

//模拟useState的实现方式
const states: any[] = [];
//记录当前的位置
let cursor: number = 0;

function useState<T>(initialState: T): [T, (newState: T) => void] {
  const currenCursor = cursor;
  states[currenCursor] = states[currenCursor] || initialState; // 检查是否渲染过

  function setState(newState: T) {
    states[currenCursor] = newState;
    render();
  }

  ++cursor; // update: cursor
  return [states[currenCursor], setState];
}

function App() {
  const [num, setNum] = useState(0);
  const [num2, setNum2] = useState(1);

  return (
    <div>
      <div>num: {num}</div>
      <div>
        <button onClick={() => setNum(num + 1)}>加 1</button>
        <button onClick={() => setNum(num - 1)}>减 1</button>
      </div>
      <hr />
      <div>num2: {num2}</div>
      <div>
        <button onClick={() => setNum2(num2 * 2)}>扩大一倍</button>
        <button onClick={() => setNum2(num2 / 2)}>缩小一倍</button>
      </div>
    </div>
  );
}

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
  cursor = 0; // 重置cursor
}

render(); // 首次渲染
```

所以如果在条件分支，函数内部，或者循环体里面使用useState可能导致运行前后的useState数组不匹配。

# useEffect的模拟实现

类似于useState，参考逻辑代码如下

```js
// 还是利用 Array + Cursor的思路
const allDeps: any[][] = [];
let effectCursor: number = 0;

function useEffect(callback: () => void, deps: any[]) {
  if (!allDeps[effectCursor]) {
    // 初次渲染：赋值 + 调用回调函数
    allDeps[effectCursor] = deps;
    ++effectCursor;
    callback();
    return;
  }

  const currenEffectCursor = effectCursor;
  const rawDeps = allDeps[currenEffectCursor];
  // 检测依赖项是否发生变化，发生变化需要重新render
  const isChanged = rawDeps.some(
    (dep: any, index: number) => dep !== deps[index]
  );
  if (isChanged) {
    callback();
    //更新为最新依赖
    allDeps[effectCursor] = deps; // 感谢 juejin@carlzzz 的指正
  }
  ++effectCursor;
}

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
  effectCursor = 0; // 注意将 effectCursor 重置为0
}

```

# react中的真实实现逻辑

> 参考文档：https://segmentfault.com/a/1190000038768433



## useEffect

**组件初始化（Mount）**：

1. 生成一个effect对象，包含创建函数
2. 缓存effect和依赖项
3. 当React进入提交阶段，执行effect中的创建函数，获取销毁函数。若销毁函数不为空，则将其放入effect。

**组件更新（Update）**：

1. 生成一个新的effect对象, 包含创建函数

2. 检查已缓存effect中是否有销毁函数，有的话则放入新effect对象

3. 缓存effect

4. 若依赖项和已缓存依赖项不同，则将hasEffect标记添加到effect，并缓存新依赖项

5. 当React进入提交阶段，判断hasEffect标记，比进行如下的操作：

   ```js
   //伪代码
   if (effect.hasEffect) {
      // 若effect中有销毁函数，则先执行销毁函数
     if(effect.destroy){
       effect.destroy();
     }
      //执行effect中的创建函数，获取销毁函数。若销毁函数不为空，则将其放入effect
     let newDestory = effect.createEffect();
     effect.destroy = newDestory;
     //放入缓存
     push(effect)
   } 
   ```

**组件销毁**：

1. 若effect中有销毁函数，则执行销毁函数。

