---
title: You have MyPromise - Promise 0 到 1
description: 从零开始实现一个 Promise
date: 2025-03-27
---

开始学习 Promise 的实现总是让我头疼，很多代码都看不懂，不知道为什么，后来逐渐发现是因为一个重要的原因是对 Promise 用法的不熟悉，或者说只熟悉基本用法。

```js
const p = new Promise((resolve, reject) => {
 if (Math.random() > .5) {
  resolve('success')
 }
 reject('fail')
})
```

比如说 then 方法可以接收两个可选的回调函数作为参数 (`onFulfilled`/`onRejected`)，那就会有四种常见情况：

**1. 第一种情况，只传 `onFulfilled`：**

```js
p.then(
 res => {
  console.log(res)
 }
).catch(
 err => {
  console.log(err)
 }
)
```

这种用法应该是最常见的，当 Promise 中的 `resolve` 执行之后，`onFulfilled` 回调就会被执行并且拿到 `resolve` 中的结果传参。如果是 `reject` 被执行，则会触发 `.catch` 中的 `onRejected` 回调。

**2. 第二种情况，同时传 `onFulfilled` 和 `onRejected`：**

```js
p.then(
 res => {
  console.log(res)
 },
 err => {
  console.log('err from then: ', err)
 }
).catch(err => {
 console.log('err from catch ', err)
})
```

此时，当 Promise 中的 `reject` 执行后 `.catch` 的回调将不会被触发。

**3. 第三种情况，传空：**

```js
p
 .then()
 .then(
  res => {
   console.log(res)
  },
  err => {
   console.log('err from then', err)
  }
 ).catch(err => {
  console.log('err from catch', err)
 })
```

此时将会发生**值的透传**，空 `then` 会把值传递给下一个带回调的 `then`。

**4. 第四种情况，在 `onFulfilled` 中返回值：**

```js
p
 .then(
  res => {
   console.log(res)
   return [res, 'plus']
  }
 )
 .then(
  res => {
   console.log(res) // [res, 'plus']
  },
  err => {
   console.log('err from then', err)
  }
 ).catch(err => {
  console.log('err from catch', err)
 })
```

此时返回的值将会被下一个 `onFulfilled` 接收到。

综上，加上对 Promise 的了解，我们可以这样来形容 Promise：

1. Promise 接收一个 `executor` 函数作为参数，该函数有两个回调函数参数 `resolve` 和 `reject` 分别用于触发和传递成功和失败时的值。
2. Promise 的实例需要有一个 `then` 方法，该方法可以接收两个回调作为参数 `onFulfilled` / `onRejected`，分别用来通过 `resolve` 和 `reject` 方法触发。
3. Promise 有三种状态：`pending`，`fulfilled`，`rejected`，这三种状态只能从 `pending` 转换到其他两种。

## 基本实现：then 的单次调用

现在让我们来简单定义一个自己的 Promise：

```js
class MyPromise {
 static PENDING = 'pending'
 static FULFILLED = 'fulfilled'
 static REJECTED = 'rejected'
 constructor(executor) {
  this.state = MyPromise.PENDING
  this.value = undefined
  this.observerFulfilledCallbacks = []
  this.observerRejectedCallbacks = []
  const resolve = (val) => {
   if (this.state === MyPromise.PENDING) {
    this.state = MyPromise.FULFILLED
    this.value = val
    this.observerFulfilledCallbacks.forEach(cb => cb(val))
   }
  }
  const reject = (reason) => {
   if (this.state === MyPromise.PENDING) {
    this.state = MyPromise.REJECTED
    this.value = reason
    this.observerRejectedCallbacks.forEach(cb => cb(reason))
   }
  }
  try {
   executor(resolve, reject)
  } catch(err) {
   reject(err)
  }
 }

 then(onFulfilled, onRejected) {
  onFulfilled && this.observerFulfilledCallbacks.push(onFulfilled)
  onRejected && this.observerRejectedCallbacks.push(onRejected)
 }
}
```

这里我们可以发现，Promise 其实应用到了**观察者模式**，`then` 方法实现的核心是将回调函数 push (订阅) 到 observerCallbacks 中。这样当执行到 Promise 的状态发生改变，执行到 `resolve` 或者 `reject` 的时候，就可以执行 observerCallbacks 中存储的订阅事件。

这样我们已经实现了单次 `then` 方法调用：

```js
const p = new MyPromise((resolve, reject) => {
 setTimeout(() => {
  if (Math.random() > .5) {
   resolve('success')
  }
  reject('fail')
 }, 1000)
})

p.then(
 res => {
  console.log(res)
 },
 err => {
  console.log(err)
 }
)
```

## 进阶实现：then 的链式调用与值透传

现在让我们来实现 Promise 的链式调用。最简单的方式就是在 `then` 方式实现的最后 `return this`：

```js
class MyPromise {
 ...
 then(...) {
  ...
  return this;
 }
}
```

但是这样的实现会有三个的问题。

问题一：无异步事件时回调无法正常执行

```js
const p = new MyPromise((resolve, reject) => {
 resolve('success')
})
p.then(
 res => {
  console.log(res) // ❌ 因为 resolve 之后 state 直接被改变，所以 observerCallbacks 都不会被执行
 }
)
```

问题二： `then` 方法回调 (`onFulfilled`/`onRejected`) 中的返回值无法传递

```js
const p = new Promise((resolve, reject) => {
 setTimeout(() => {
  if (Math.random() > .5) {
   resolve('success')
  }
  reject('fail')
 }, 1000)
})
p.then(
 res => {
  console.log(res)
  return 'new res'
 }
).then(
 res => {
  console.log(res) // ❌ 我们希望这里的 res 是 'new res' 但依旧是第一次是 'success'
 }
)
```

问题三：值的透传也失败

```js
const p = new Promise((resolve, reject) => {
 setTimeout(() => {
  if (2 > .5) {
   resolve('success')
  }
  reject('fail')
 }, 1000)
})
p.then().then(
 res => {
  console.log(res) // ❌ 我们希望这里的 res 是 'success'
 }
)
```

这里我们的解决方案是 `then` 方法最后不返回 `this`，而是返回一个新的 Promise 实例：

```js
class MyPromise {
 // ...
 then(onFulfilled, onRejected) {
  // 当用户不传递成功或失败的回调函数时，我们需要给一个默认的回调函数，实现透传
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
  onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
  return new MyPromise((resolve, reject) => {
   const fulfillHandler = (value) => {
    try {
     const result = onFulfilled(value);
     resolve(result);
    } catch (err) {
     reject(err);
    }
   };
   const rejectHandler = (reason) => {
    try {
     const result = onRejected(reason);
     reject(result);
    } catch (err) {
     reject(err);
    }
   };
   if (this.state === MyPromise.PENDING) {
    this.observerFulfilledCallbacks.push(fulfillHandler)
    this.observerRejectedCallbacks.push(rejectHandler)
   }
   if (this.state === MyPromise.FULFILLED) {
    fulfillHandler(this.value)
   }
   if (this.state === MyPromise.REJECTED) {
    rejectHandler(this.value)
   }
  })
 }
}
```

现在同步事件，回调值的传递，值的透传都可以正常工作了。

但又有新的情况，假如我们在回调中返回 Promise 呢？

```js
const p = new MyPromise((resolve, reject) => {
 setTimeout(() => {
  if (2 > .5) {
   resolve('then1')
  }
  reject('fail')
 }, 1000)
})
p.then(
 res => {
  console.log(res)
  return new MyPromise((resolve, reject) => {
   setTimeout(() => {
    resolve('then2')
   }, 100)
  })
 }
).then(
 res => {
  console.log(res)
 }
)
```

我们期待的结果是依次输出 then1，then2。但是我们的代码执行结果是：

```bash
then1
MyPromise {
  state: 'pending',
  value: undefined,
  observerFulfilledCallbacks: [],
  observerRejectedCallbacks: []
}
```

显然这不是我们想要的。回看我们的实现，或许可以在 `then` 的回调事件上做一些调整：

```js
class MyPromise {
 //...
 then(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
  onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
  return new MyPromise((resolve, reject) => {
   const fulfillHandler = (value) => {
    try {
     const result = onFulfilled(value);
     if (result && typeof result.then === 'function') {
      result.then(resolve, reject)
     } else {
      resolve(result)
     }
    } catch (err) {
     reject(err);
    }
   };
   const rejectHandler = (reason) => {
    try {
     const result = onRejected(reason);
     if (result && typeof result.then === 'function') {
      result.then(resolve, reject);
     } else {
      resolve(result);
     }
    } catch (err) {
     reject(err);
    }
   };
   if (this.state === MyPromise.PENDING) {
    this.observerFulfilledCallbacks.push(fulfillHandler)
    this.observerRejectedCallbacks.push(rejectHandler)
   }
   if (this.state === MyPromise.FULFILLED) {
    fulfillHandler(this.value)
   }
   if (this.state === MyPromise.REJECTED) {
    rejectHandler(this.value)
   }
  })
 }
}
```

到这里，我们的 Promise 其实已经可以覆盖大部分的情况了，我们已经实现了以下功能：

1. 通过观察者模式实现 `onFulfilled` / `onRejected` 的异步调用。
2. `then` 方法的普通以及异步链式调用。
3. `then` 方法的值透传。

## 完备实现：通过 Promises A+ 测试

但是 `then` 方法还是不够完善，存在以下问题需要解决：

1. Promise 的循环引用检查
2. 防止多次解析同一个 Promise
3. 对 `then` 方法的错误处理
4. 缺少递归解析 Promise

```js
// 1. Promise 的循环引用检查
const p1 = new MyPromise(resolve => resolve());
const p2 = p1.then(() => p2); // Circular reference!

// 2. 多次解析同一个 Promise
const badThenable = {
  then(onFulfill, onReject) {
    onFulfill(1);
    onFulfill(2); // Second call should be ignored
    onReject(new Error('Should be ignored')); // Should be ignored
  }
};
const p = new MyPromise(resolve => resolve(badThenable));

// 3. 抛错处理
const evilThen = {
  get then() { 
    throw new Error('Accessing .then throws'); 
  }
};
const p = new MyPromise(resolve => resolve(evilThen));

// 4. 递归解析
const p1 = new MyPromise(resolve => 
  resolve(new MyPromise(resolve => 
    resolve(new MyPromise(resolve => 
      resolve('deep value')
    ))
  ))
);
```

为此我们需要将代码调整为以下形式：

```js
const resolvePromise = (thenPromise, ret, resolve, reject) => {
 // 解决循环引用的问题
 if (thenPromise === ret) {
  // Promise 规范要求抛出 TypeError
  return reject(new TypeError('Chaining cycle detected for promise'))
 }

 // 解决多次解析同一个 Promise 的问题 by called flag
 let called = false
 if (ret !== null && (typeof ret === 'object' || typeof ret === 'function')) {
  try {
   let then = ret.then;
   if (typeof then === 'function') {
    then.call(
     ret,
     res => {
      if (called) return
      called = true
      // 解决递归解析
      resolvePromise(thenPromise, res, resolve, reject)
     },
     err => {
      if (called) return
      called = true
      reject(err)
     }
    )
   } else {
    resolve(ret)
   }
  } catch (err) {
   if (called) return
   called = true
   reject(err)
  }
 } else {
  resolve(ret)
 }
}

class MyPromise {
 // ...
 then(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val
  onRejected = typeof onRejected === 'function' ? onRejected : err => {throw err}
  const thenPromise = new MyPromise((resolve, reject) => {
   const fulfilledHandler = (val) => {
    queueMicrotask(() => {
     try {
      const ret = onFulfilled(val)
      resolvePromise(thenPromise, ret, resolve, reject)
     } catch (err) {
      reject(err)
     }
    })
   }
   const rejectedHandler = (reason) => {
    queueMicrotask(() => {
     try {
      const ret = onRejected(reason)
      resolvePromise(thenPromise, ret, resolve, reject)
     } catch (err) {
      reject(err)
     }
    })
   }
   if (this.state === MyPromise.PENDING) {
    this.observerFulfilledCallbacks.push(fulfilledHandler)
    this.observerRejectedCallbacks.push(rejectedHandler)
   }
   if (this.state === MyPromise.FULFILLED) {
    fulfilledHandler(this.value)
   }
   if (this.state === MyPromise.REJECTED) {
    rejectedHandler(this.value)
   }
  })
  return thenPromise
 }
}
```

这样我们的 Promise 实现基本就符合 [Promises/A+](https://promisesaplus.com/) 的规范了，可以通过 [官方的测试工具](https://github.com/promises-aplus/promises-tests) 来测试。

## 补充实现

完成主要方法 then 的实现后，剩下的 2 个实例方法和 5 个静态方法相对会简单很多。

### Promise.prototype.catch

```js
class MyPromise {
 constructor(executor) {...}
 then(onFulfilled, onRejected) {...}

 catch(onRejected) {
  return this.then(null, onRejected)
 }
}
```

### Promise.prototype.finally

```js
class MyPromise {
 //...
 finally(fn) {
  return this.then(fn, fn)
 }
}
```

### Promise.resolve

```js
class MyPromise {
 // ...
 static resolve(val) {
  return new MyPromise((resolve, reject) => {
   resolve(val)
  })
 }
}
```

### Promise.reject

```js
class MyPromise {
 // ...
 static reject(val) {
  return new MyPromise((resolve, reject) => {
   reject(val)
  })
 }
}
```

### Promise.all

```js
class MyPromise {
 // ...
 static all(promises) {
  return new MyPromise((resolve, reject) => {
   const result = []
   let count = 0
   for (let i = 0; i < promises.length; i++) {
    promises[i].then(
     data => {
      result[i] = data
      if (++count === promises.length) {
       resolve(result)
      }
     },
     err => {
      reject(err)
     }
    )
   }
  })
 }
}
```

### Promise.race

```js
class MyPromise {
 // ...
 static race(promises) {
  return new MyPromise((resolve, reject) => {
   promises.forEach(p => {
    p.then(resolve, reject)
   })
  })
 }
}
```

### Promise.allSettle

```js
class MyPromise {
 // ...
 static allSettle(promises) {
  return new MyPromise((resolve, reject) => {
   const results = []
   let count = 0
   promises.forEach((p, i) => {
    p.finally(
     value => {
      results[i] = {
       status: 'fulfilled',
       value
      };
      if (++count === promises.length) {
       resolve(results)
      }
     },
     reason => {
      results[i] = {
       status: 'rejected',
       reason
      };
      if (++count === promises.length) {
       reject(results)
      }
     }
    )
   });
  })
 }
}
```

## 参考文档

- <https://juejin.cn/post/6844904147884441608>

## 代码仓库

- <https://github.com/13ruceYu/my-promise>
