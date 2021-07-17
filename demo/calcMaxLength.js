function calcMaxLength(str) {
  if (!str) return 0;
  let map = new Array(128).fill(-1);
  let start = 0;
  let maxLength = 0;

  for (let i = 0; i < str.length; i++) {
    let el = str[i];
    const code = el.charCodeAt();
    const preIndex = map[code];
    if (preIndex === -1) {
      map[code] = i;
    } else {
      if (preIndex >= start) {
        start = preIndex + 1;
      }
      map[code] = i;
    }
    maxLength = Math.max(maxLength, i - start + 1);
  }
  return maxLength;
}

var count = calcMaxLength("abcabcbb");

console.log(count);
