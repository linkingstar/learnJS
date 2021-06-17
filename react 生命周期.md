# [生命周期](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)

> 参考文档：https://zh-hans.reactjs.org/docs/react-component.html#static-getderivedstatefromprops

# 挂载阶段

- 构造函数 constructor()  
  可以再此处初始化 state

- static getDerivedStateFromProps() 静态方法，可以返回初始化的状态

- render()

- UNSAFE_componentWillMount();

- componentDidMount();  
  适合在该函数中获取数据，可以直接在此处调用`setState()`

# 更新

- static getDerivedStateFromProps()
- UNSAFE_componentWillUpdate() 允许用户控制是否更新
- UNSAFE_componentWillReceiveProps()
- shouldComponentUpdate() 允许用户控制是否更新
  > 如果返回 false，则不会触发更新。首次渲染或使用 `forceUpdate()` 时不会调用该方法
- render()
- getSnapshotBeforeUpdate() 在此处可以从 DOM 中获取信息，返回的参数将被传入 componentDidUpdate 函数
  > 例如
  >
  > ```js
  > class ScrollingList extends React.Component {
  >  constructor(props) {
  >    super(props);
  >    this.listRef = React.createRef();
  >  }
  >
  >  getSnapshotBeforeUpdate(prevProps, prevState) {
  >    // 我们是否在 list 中添加新的 items ？
  >    // 捕获滚动​​位置以便我们稍后调整滚动位置。
  >    if (prevProps.list.length < this.props.list.length) {
  >      const list = this.listRef.current;
  >      return list.scrollHeight - list.scrollTop;
  >    }
  >    return null;
  >  }
  >
  >  componentDidUpdate(prevProps, prevState, snapshot) {
  >    // 如果我们 snapshot 有值，说明我们刚刚添加了新的 items，
  >    // 调整滚动位置使得这些新 items 不会将旧的 items 推出视图。
  >    //（这里的 snapshot 是 getSnapshotBeforeUpdate 的返回值）
  >    if (snapshot !== null) {
  >      const list = this.listRef.current;
  >      list.scrollTop = list.scrollHeight - snapshot;
  >    }
  >  }
  >
  >  render() {
  >    return (
  >      <div ref={this.listRef}>{/* ...contents... */> }</div>
  >     );
  >   }
  > }
  > ```
- componentDidUpdate()

  ```js
  function componentDidUpdate(prevProps, prevState, snapshot);
  ```

  每次更新后将立即调用，但是首次渲染不会执行该方法。你可以在该方法中加入条件判断，用来重新获取数据，或者用来更新 state，但是`必须加入条件判断`

# 卸载

- componentWillUnmount()

# 错误处理

- static getDerivedStateFromError()
- componentDidCatch()

## getDerivedStateFromError

当组件发生错误时会调用该函数

```js
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染可以显降级 UI
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // 你可以渲染任何自定义的降级  UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

Error boundaries 是 React 组件，它会在`其子组件树中的任何位置捕获` JavaScript 错误，并记录这些错误，展示降级 UI 而不是崩溃的组件树。Error boundaries 组件会捕获在渲染期间，在生命周期方法以及其整个树的构造函数中发生的错误。

如果 class 组件定义了生命周期方法 `static getDerivedStateFromError()` 或 `componentDidCatch()` 中的任何一个（或两者），它就成为了 Error boundaries。通过生命周期更新 state 可让组件捕获树中未处理的 JavaScript 错误并展示降级 UI。

仅使用 Error boundaries 组件来从意外异常中恢复的情况；不要将它们用于流程控制。

> 需要注意的是子组件发生错误会被 catch

# setState

需要明白 setState 是异步的，react 会在合适的时候更新 state，因此你不应该在 setState 之后立即去读取 this.state，相应的你应该是用`componentDidUpdate`或者利用 setState 的第二个`callback`参数

# forceUpdate

该方法将强制组件更新,该方法会跳过`shouldComponentUpdate()`函数调用，但是子组件还是会正常触发该方法。通常情况下建议使用 setState

```js
component.forceUpdate(callback);
```
