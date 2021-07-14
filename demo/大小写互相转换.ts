//方法1
function revert(str) {
  if (!str) return str;
  return str
    .split('')
    .map((i) => {
      let low = i.toLowerCase();
      let upper = i.toUpperCase();
      if (low === upper) return i;
      return i === low ? upper : low;
    })
    .join('');
}

//方法2
const a = 'a'.charCodeAt(0);
const z = 'z'.charCodeAt(0);
const A = 'A'.charCodeAt(0);
const Z = 'Z'.charCodeAt(0);
const diff = a - A;

function covert(str) {
  if (!str) return str;
  return str
    .split('')
    .map((i) => {
      let code = i.charCodeAt(0);
      if (a <= code && code <= z) {
        return String.fromCharCode(code - diff);
      }
      if (A <= code && code <= Z) {
        return String.fromCharCode(code + diff);
      }
      return i;
    })
    .join('');
}
