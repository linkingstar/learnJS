# SandBox 沙箱原理

- **`snapshotSandbox`** 快照沙箱
- **`proxySandbox`** 多个代理沙箱
- **`legacySandbox`** 单例代理沙箱

## snapshotSandbox

  激活沙箱时，将`window`的快照信息存到`windowSnapshot`中， 如果`modifyPropsMap`有值，还需要还原上次的状态；激活期间，可能修改了`window`的数据；退出沙箱时，将修改过的信息存到`modifyPropsMap`里面，并且把`window`还原成初始进入的状态。

![img](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/056a19b9fc9949dabc4449300dd54645~tplv-k3u1fbpfcp-watermark.image)

> 当浏览器不支持proxy时，会使用该模式。该模式会污染全局window

## proxy SandBox

![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bf323659306d4bd0b64cac5a9e16bc13~tplv-k3u1fbpfcp-watermark.image)

本质上创建了一个fakeWindow的对象，并在该对象上设置了proxy。

核心代码如下:

```js
	  const rawWindow = window;
    const fakeWindow = Object.create(null) as Window;

    const proxy = new Proxy(fakeWindow, {
      set: (_: Window, p: PropertyKey, value: any): boolean => {
        if (this.sandboxRunning) {
          if (!rawWindow.hasOwnProperty(p)) {
            addedPropsMapInSandbox.set(p, value);
          } else if (!modifiedPropsOriginalValueMapInSandbox.has(p)) {
            // 如果当前 window 对象存在该属性，且 record map 中未记录过，则记录该属性初始值
            const originalValue = (rawWindow as any)[p];
            modifiedPropsOriginalValueMapInSandbox.set(p, originalValue);
          }

          currentUpdatedPropsValueMap.set(p, value);
          // 必须重新设置 window 对象保证下次 get 时能拿到已更新的数据
          // eslint-disable-next-line no-param-reassign
          (rawWindow as any)[p] = value;

          this.latestSetProp = p;

          return true;
        }

        if (process.env.NODE_ENV === 'development') {
          console.warn(`[qiankun] Set window.${p.toString()} while sandbox destroyed or inactive in ${name}!`);
        }

        // 在 strict-mode 下，Proxy 的 handler.set 返回 false 会抛出 TypeError，在沙箱卸载的情况下应该忽略错误
        return true;
      },

      get(_: Window, p: PropertyKey): any {
        // avoid who using window.window or window.self to escape the sandbox environment to touch the really window
        // or use window.top to check if an iframe context
        // see https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js#L13
        if (p === 'top' || p === 'parent' || p === 'window' || p === 'self') {
          return proxy;
        }

        const value = (rawWindow as any)[p];
        return getTargetValue(rawWindow, value);
      },

      // trap in operator
      // see https://github.com/styled-components/styled-components/blob/master/packages/styled-components/src/constants.js#L12
      has(_: Window, p: string | number | symbol): boolean {
        return p in rawWindow;
      },

      getOwnPropertyDescriptor(_: Window, p: PropertyKey): PropertyDescriptor | undefined {
        const descriptor = Object.getOwnPropertyDescriptor(rawWindow, p);
        // A property cannot be reported as non-configurable, if it does not exists as an own property of the target object
        if (descriptor && !descriptor.configurable) {
          descriptor.configurable = true;
        }
        return descriptor;
      },
    });
```

#### **legacySandbox优劣势**

同样会对window造成污染，但是性能比快照沙箱好，不用遍历window对象。

## proxySandbox

允许多个子应用同时存在，并且每个子应用都有独立的window，全局的window不会被污染。

