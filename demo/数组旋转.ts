function round<T>(array: T[], move: number) {
  if (array.length <= move) {
    return array;
  }
  let head = array.slice(array.length - move);
  return head.concat(array.slice(0, array.length - move));
}

function roundArray(array, move) {
  if (array.length <= move) {
    return array;
  }
  let head = array.slice(array.length - move);
  return head.concat(array.slice(0, array.length - move));
}
