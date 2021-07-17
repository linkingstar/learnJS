# baseLevel

由于最新的taro是使用template进行渲染，当组件嵌套层级过深之后，会导致setData时的路径过长，最终会影响性能，因此提供了一个baseLevel的全局参数，来控制超过多少层之后就使用原生组件

但是目前存在的问题是

- flex跨原生组件会失效
- `SelectorQuery.select` 方法的[跨自定义组件的后代选择器](https://developers.weixin.qq.com/miniprogram/dev/api/wxml/SelectorQuery.select.html)写法需要增加 `>>>`：`.the-ancestor >>> .the-descendant`

为了解决全局配置的问题，taro新增的了customWrapper，被customWrapper包裹的组件使用原生自定义组件

```jsx
import { View, Text } from '@tarojs/components'

export default function () {
  return (
    <View className='index'>
      <Text>Demo</Text>
      <CustomWrapper>
        <GoodsList />
      </CustomWrapper>
    </View>
  )
}
```

# 优化初始化渲染问题

可以使用预渲染的来处理这些问题

## 进行配置

```js
// /config/index.js 或 /config/dev.js 或 /config/prod.js
const config = {
  ...
  mini: {
    prerender: {
      match: 'pages/shop/**', // 所有以 `pages/shop/` 开头的页面都参与 prerender
      include: ['pages/any/way/index'], // `pages/any/way/index` 也会参与 prerender
      exclude: ['pages/shop/index/index'] // `pages/shop/index/index` 不用参与 prerender
    }
  }
};

module.exports = config
```

## 使用typeof `PRERENDER`判断是否是预渲染

```js
if (typeof PRERENDER !== 'undefined') { // 以下代码只会在预渲染中执行
  // do something
}
```

- disablePrerender 禁用某个组件的预渲染

- 自定义预渲染的数据以及XML

- 使用nextTick处理预渲染过多页面的问题

  ```jsx
  class SomePage extends Component {
    state = {
      mounted: false
    }
  
    componentDidMount () {
      // 等待组件载入，先渲染了首屏我们再渲染其它内容，降低首次渲染的数据量
      // 当 mounted 为 true 时，CompA, B, C 的 DOM 树才会作为 data 参与小程序渲染
      // 注意我们需要在 `componentDidMount()` 这个周期做这件事（对应 Vue 的 `ready()`），更早的生命周期 `setState()` 会与首次渲染的数据一起合并更新
      // 使用 nextTick 确保本次 setState 不会和首次渲染合并更新
      Taro.nextTick(() => {
        this.setState({
          mounted: true
        })
      })
    }
  
    render () {
      return <View>
        <FirstScreen /> /* 假设我们知道这个组件会把用户的屏幕全部占据 */
        {this.state.mounted && <React.Fragment> /* CompA, B, C 一开始并不会在首屏中显示 */
          <CompA />
          <CompB />
          <CompC />
        </React.Fragment>}
      </View>
    }
  }
  ```

  # 长列表渲染问题

  使用虚拟列表避免长列表渲染的效率问题，但是需要指定每个item的高度，以及整个列表的高度