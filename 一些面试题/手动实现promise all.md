```js
var promiseAll = function (promiseList) {
  return new Promise((resolve, reject) => {
    if (!promiseList || !promiseList.length) {
      return resolve([]);
    }
    const total = promiseList.length;
    const result = new Array(total).fill(null);
    let hasError = false;
    let finishCount = 0;
    promiseList.forEach((p, index) => {
      if (hasError) return;
      //非promise
      if (!p.then) {
        result[index] = p;
        finishCount++;
        if (finishCount === total) {
          resolve(result);
        }
        return;
      }
      p.then((res) => {
        result[index] = res;
        finishCount++;
        if (finishCount === total) {
          resolve(result);
        }
      }).catch((e) => {
        hasError = true;
        reject(e);
      });
    });
  });
};
let p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve("promise1");
  }, 1000);
});
let p2 = new Promise((resolve) => {
  setTimeout(() => {
    resolve("promise2");
  }, 500);
});
// let p3 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     reject("error");
//   }, 500);
// });

promiseAll([p1, p2, [1, 2, 3]])
  .then((res) => console.log("success", res))
  .catch((e) => console.log(e));

```