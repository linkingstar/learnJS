var convert = function (s, numRows) {
  if (numRows < 2) {
    return s;
  }
  let unit = numRows === 2 ? 4 : 2 * numRows - 2;
  const maxLength = s.length;
  //获取 n/n-2的组数，可能会有内存浪费
  const column = Math.ceil(maxLength / unit) * 2;
  const matrix = [];
  //构造matrix
  for (let row = 0; row < numRows; row++) {
    const rows = new Array(column).fill(null);
    matrix.push(rows);
  }

  //init data
  let index = 0;
  for (let col = 0; col < column; col++) {
    const isEven = col % 2 === 0;
    if (index > s.length - 1) {
      break;
    }
    if (numRows === 2) {
      matrix[0][col] = s[index];
      index++;
      matrix[1][col] = s[index];
      index++;
      continue;
    }
    if (isEven) {
      //偶数就从上往下 0 ~ row
      for (let row = 0; row < numRows; row++) {
        matrix[row][col] = s[index];
        index++;
      }
    } else {
      //就下往上 row - 2 到 0
      for (let row = numRows - 2; row > 0; row--) {
        matrix[row][col] = s[index];
        index++;
      }
    }
  }
  console.log(matrix);

  //out put
  let newStr = [];
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < column; ++col) {
      const val = matrix[row][col];
      if (val !== null) {
        newStr.push(val);
      }
    }
  }
  return newStr.join('');
};

let result = convert('PAYPALISHIRING', 3);
console.log(result);
