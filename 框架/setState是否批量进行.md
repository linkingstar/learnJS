参考Stack Overflow的提问

https://stackoverflow.com/questions/48563650/does-react-keep-the-order-for-state-updates/48610973#48610973

得出结论如果处于react 的事件处理中，那么setState就会进行批量浅合并，并且最终只会更新一次，如果setState调用的时刻不处于react的事件回调，那么setState就会立即生效，不会进行批量合并。

以下是原文：

Currently (React 16 and earlier), **only updates inside React event handlers are batched by default**. There is an unstable API to force batching outside of event handlers for rare cases when you need it.

当前的react只会在事件的回调中默认进行批量处理（虽然提供了一个unstable api允许强制开启批量处理）

The key to understanding this is that **no matter how many `setState()` calls in how many components you do \*inside a React event handler\*, they will produce only a single re-render at the end of the event**.

在react的事件处理函数中无论调用了多少次setState都会生成事务，并且对state进行浅合并，最终只会更新一次

The updates are always **shallowly merged in the order they occur**. So if the first update is `{a: 10}`, the second is `{b: 20}`, and the third is `{a: 30}`, the rendered state will be `{a: 30, b: 20}`. The more recent update to the same state key (e.g. like `a` in my example) always "wins".

However, both in React 16 and earlier versions, **there is yet no batching by default outside of React event handlers**. So if in your example we had an AJAX response handler instead of `handleClick`, each `setState()` would be processed immediately as it happens. In this case, yes, you **would** see an intermediate state:

```js
promise.then(() => {
  // We're not in an event handler, so these are flushed separately.
  this.setState({a: true}); // Re-renders with {a: true, b: false }
  this.setState({b: true}); // Re-renders with {a: true, b: true }
  this.props.setParentState(); // Re-renders the parent
});
```

虽然也可以通过调用函数让他们进行批量合并更新

```js
promise.then(() => {
  // Forces batching
  ReactDOM.unstable_batchedUpdates(() => {
    this.setState({a: true}); // Doesn't re-render yet
    this.setState({b: true}); // Doesn't re-render yet
    this.props.setParentState(); // Doesn't re-render yet
  });
  // When we exit unstable_batchedUpdates, re-renders once
});
```

在未来的版本可能会解决这种不统一的问题，全部都变成批量合并更新

