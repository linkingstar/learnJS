console.log('m1');

process.nextTick(function A() {
  console.log('t1');
  process.nextTick(function B() {
    console.log('t2');
  });
});

console.log('m2');

setTimeout(function timeout() {
  console.log('TIMEOUT FIRED');
}, 0);

console.log('m3');

setImmediate(function A() {
  console.log(1);
  setImmediate(function B() {
    console.log(2);
  });
});

process.nextTick(function A() {
  console.log('t3');
  process.nextTick(function B() {
    console.log('t4');
  });
});
