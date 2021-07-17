/**
 * 获取最长子串
 *
 *  输入：s = "babad"
 *   输出："bab"
 *   解释："aba" 同样是符合题意的答案。
 *
 */
function longestPalindrome(str) {
  if (!str) return str;
  const total = str.length;
  if (total === 1) {
    return str;
  }
  //根据当前节点，或者两个节点的中间虚拟节点往左右两边匹配
  let start = -1;
  let length = -1;
  let maxLength = -1;
  for (let i = 0; i < str.length; ++i) {
    //以i跟i-1的中间节点比对
    let j = i;
    let k = i + 1;
    while (true) {
      if (str[j] !== str[k]) {
        j++;
        k--;
        break;
      }
      if (j === 0 || k === str.length - 1) {
        break;
      }
      j--;
      k++;
    }
    length = k - j + 1;
    if (maxLength < length) {
      start = j;
      maxLength = length;
    }

    if (i === 0) {
      continue;
    }
    //以i为中心点对比
    j = i - 1;
    k = i + 1;
    while (true) {
      if (str[j] !== str[k]) {
        j++;
        k--;
        break;
      }
      if (j === 0 || k === str.length - 1) {
        break;
      }
      j--;
      k++;
    }
    length = k - j + 1;
    if (maxLength < length) {
      start = j;
      maxLength = length;
    }
  }
  if (start !== -1 && maxLength !== -1) {
    return str.substr(start, maxLength);
  }
  return str[0];
}

var result = longestPalindrome('babad');
console.log(result);
