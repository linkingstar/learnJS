function compare(current, left, right) {
  if (current === null) {
    if (left !== null && right !== null) {
      return left < right ? 1 : 2;
    }
    return left !== null ? 1 : 2;
  }
  if (left !== null && right !== null) {
    const ldiff = left - current;
    const rdiff = right - current;
    return ldiff < rdiff ? 1 : 2;
  }
  return left !== null ? 1 : 2;
}

function mergeArray(left, right) {
  const merged = [];
  while (left.length || right.length) {
    const num1 = left.length ? left[0] : null;
    const num2 = right.length ? right[0] : null;
    const current = merged.length ? merged[merged.length - 1] : null;
    const side = compare(current, num1, num2);
    if (side === 1) {
      //push left
      merged.push(num1);
      left.shift();
    } else {
      merged.push(num2);
      right.shift();
    }
  }
  return merged;
}

function findMedianSortedArrays(num1, num2) {
  const merged = mergeArray(num1, num2);
  if (!merged.length) {
    return 0;
  }
  const isEven = merged.length % 2 === 0;
  if (isEven) {
    // 偶数
    let index = merged.length / 2 - 1;
    return (merged[index] + merged[index + 1]) / 2.0;
  }
  const index = (merged.length + 1) / 2 - 1;
  return merged[index];
}

const number = findMedianSortedArrays([1, 2, 3,7], [5,6]);
console.log(number);
