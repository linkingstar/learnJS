# 老版本taro原理

3.x之前的taro主要分为两个阶段

- 通过`babel`将代码编译成对应小程序平台的代码,如：`JS`、`WXML`、`WXSS`、`JSON`。
- 在运行时进行生命周期，setData等函数的对接

## babel编译

先将源代码解析成AST——抽象语法树，然后对抽象语法树进行修改转换等操作，最后再生成目标平台的代码

> 这块最大的功能逻辑是在处理jsx编译的问题上，因此在很大的程度上限制了jsx的写法

## Taro 运行时

对比编译前后的代码

```js
// 编译前
import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

export default class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }

  componentDidMount () { }

  render () {
    return (
      <View className=‘index' onClick={this.onClick}>
        <Text>Hello world!</Text>
      </View>
    )
  }
}

// 编译后
import {BaseComponent, createComponent} from '@tarojs/taro-weapp'

class Index extends BaseComponent {

// ... 

  _createDate(){
    //process state and props
  }
}

export default createComponent(Index)

作者：凹凸实验室
链接：https://juejin.cn/post/6844904036743774216
来源：掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```

可以发现编译后的代码继承自BaseComponent，而BaseComponent类主要对于setState等函数进行了替换和重写。

**Taro 当前架构只是在开发时遵循了 React 的语法，在代码编译之后实际运行时，和 React 并没有关系**。

## 总结

因此，整个 Taro 当前架构的特点是：

- **重编译时，轻运行时**：这从两边代码行数的对比就可见一斑。
- 编译后代码与 React 无关：Taro 只是在开发时遵循了 React 的语法。
- 直接使用 Babel 进行编译：这也导致当前 Taro 在工程化和插件方面的羸弱。

# Taro Next架构

这次我们从浏览器的角度考虑问题，无论采用什么框架，最终都会调用DOM/BOM相关的api，例如createElement，appendChild，removeChild等。

因此我们创建了taro-runtime包，并在包里面实现了一套高效精简的DOM/BOM API

> BOM全称为浏览器对象模型，可以简单的认为是提供操作游览器的对象——window

然后在通过webpack的`ProvidePlugin`注入到小程序运行时。

> ProvidePlugin 可以自动加载module，而不需要进行import或者require调用
>
> 如下，我们就可以直接在代码中使用_map()函数
>
> ```javascript
> new webpack.ProvidePlugin({
>   _map: ['lodash', 'map'],
> });
> ```

使用这套API就能与react或者vue完成最终的渲染对接

# 对接React

React 16+的核心架构主要包含了三个部分

- react-core react核心部分

- react-reconciler react协调层，包含虚拟dom diff，以及fiber

- react-render 渲染层，根据不同的平台进行渲染，并且提供HostComponent、处理事件

  例如React-Dom，React-Native等等

![image](https://user-gold-cdn.xitu.io/2020/1/2/16f66097be89a5d0?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

taro在react的基础上实现taro-react，用来对接react-reconciler跟taro-runtime(包含自定义的BOM/DOM api)。

实现原理如下

- 实现react-reconciler的hostConfig配置——在hostConfig中调用taro-runtime中的方法

- 实现render函数——可以看成是创建 `Taro DOM Tree` 的容器。

  替换react render生成自己的DOM Tree

## 渲染Taro DOM Tree

1. 首先对小程序的所有组件进行模板化处理生成模板文件

   例如将微信平台下的view转换成对应的模板文件

   ![image](https://user-gold-cdn.xitu.io/2020/1/2/16f66097e4a71279?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

2. 基于组件的模板文件，动态递归渲染整个DOM树

   具体流程为先去遍历 `Taro DOM Tree` 根节点的子元素，再根据每个子元素的类型选择对应的模板来渲染子元素，然后在每个模板中我们又会去遍历当前元素的子元素，以此把整个节点树递归遍历出来。
   
   > 这一步生成了最终的小程序页面模板

## Taro与React流程一览

![image](https://user-gold-cdn.xitu.io/2020/1/2/16f66097ec966e49?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

实现hostConfig完成DOM/BOM api对接，然后再调用createReactPage进行模板替换，最终在setData之后将页面渲染出来。

# Vue对接

对接Vue与对接React类似，最大的差别在createVuePage函数，这个函数进行了生命周期的对齐，其他的都与对接react类似

# 更多实现细节

## 事件处理

在进行模板化的过程中，taro会将所有的事件绑定到`eh`函数，然后在`eh`函数中通过`getElementById`获取到对应的taro node节点，同时生成新的taro event，最终将事件dispatch到该node。

![image](https://user-gold-cdn.xitu.io/2020/1/2/16f66097f28e7f7c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## 更新

无论是 React 还是 Vue ，最终都会调用 Taro DOM 方法，如：`appendChild`、`insertChild` 等。

这些方法在修改 Taro DOM Tree 的同时，还会调用 `enqueueUpdate` 方法，这个方法能获取到每一个 DOM 方法最终修改的节点路径和值，如：`{root.cn.[0].cn.[4].value: "1"}`，并通过 `setData` 方法更新到视图层。

![image](https://user-gold-cdn.xitu.io/2020/1/2/16f6609814a10077?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## 生命周期

主要就是提供小程序符合小程序规则的接口，并与相应的taro调用对齐,形式如下。

```js
const config: PageInstance = {
  onLoad (this: MpInstance, options) {
    //...
  },
  onUnload () {
    //...
  },
  onShow () {
    safeExecute('onShow')
  },
  onHide () {
    safeExecute('onHide')
  },
  onPullDownRefresh () {
    safeExecute('onPullDownRefresh')
  }
  //...
}
```

# Taro 新架构的特点

有原先的重编译，轻运行变成了几乎完全运行时。

新的架构基本解决了之前的遗留问题：

- **无 DSL 限制**：无论是你们团队是 React 还是 Vue 技术栈，都能够使用 Taro 开发

  > DSL——Domain Specific Languages ——领域特殊语言，说人话就是技术栈

- **模版动态构建**：和之前模版通过编译生成的不同，Taro Next 的模版是固定的，然后基于组件的 template，动态 “递归” 渲染整棵 Taro DOM 树。

- **新特性无缝支持**：由于 Taro Next 本质上是将 React/Vue 运行在小程序上，因此，各种新特性也就无缝支持了。

- **社区贡献更简单**：错误栈将和 React/Vue 一致，团队只需要维护核心的 taro-runtime。

- **基于 Webpack**：Taro Next 基于 Webpack 实现了多端的工程化，提供了插件功能

# taro next性能优化

由于taro 3.x完全基于运行时，因此需要尽可能的进行性能优化

## 打包size问题？

由于引入了react/vue增加了包大小，但是当页面多于一定数量时，包大小反而比旧版本taro更小（新版本的模板数是固定——基于各个平台小程序的模板，老版本会针对每个页面都生成WXML）

## DOM Tree

taro实现了不到1000行的精简版DOM/BOM api，也极大的缩减了最后的包大小

## update Data 数据更新

在数据更新阶段，首先前面有提到过，Taro Next 的更新是 DOM 级别的，比 Data 级别的更新更加高效，因为 **Data 粒度更新实际上是有冗余的，并不是所有的 Data 的改变最后都会引起 DOM 的更新**。

其次，Taro 在更新的时候将 Taro DOM Tree 的 `path` 进行压缩，这点也极大的提升了性能。



![image](https://user-gold-cdn.xitu.io/2020/1/2/16f6609823ad01a1?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



最终的结果是：在某些业务场景写，`add`、`select` 数据，Taro Next 的性能比原生的还要好。

# 参考文档

https://juejin.cn/post/6844904036743774216

