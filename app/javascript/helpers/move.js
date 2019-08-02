import { find, findIndex, some, reject } from 'lodash';

// [{id: 123}], [123] => [0]
function idsToElements(arr, ids) {
  return ids.map((id) => find(arr, { id }));
}

function idsToIndexes(arr, ids) {
  return ids.map((id) => findIndex(arr, { id }));
}

function removeElements(arr, elements) {
  return reject(arr, (elem) => some(elements, elem));
}

function filterIndexes(indexes) {
  if (indexes[0] !== 0) {
    return indexes;
  }
  var previous = 0;
  var filteredIndexes = [];
  indexes.forEach(function(index) {
    if (index !== 0 && index - 1 !== previous) {
      filteredIndexes.push(index);
    } else {
      previous = index;
    }
  });
  return filteredIndexes;
}

function filterReverseIndexes(indexes, endIndex) {
  if (indexes[0] !== endIndex) {
    return indexes;
  }
  var previous = endIndex;
  var filteredIndexes = [];
  indexes.forEach(function(index) {
    if (index !== endIndex && index + 1 !== previous) {
      filteredIndexes.push(index);
    } else {
      previous = index;
    }
  });
  return filteredIndexes;
}

function stepUp(array, index) {
  if (index < 1) {
    return;
  }

  [array[index], array[index - 1]] = [array[index - 1], array[index]];
}

function stepDown(array, index) {
  if ((index < 0) || (index >= array.length - 1)) {
    return;
  }

  [array[index], array[index + 1]] = [array[index + 1], array[index]];
}


// move selected elements between two arrays
export function between({from, to, selected}) {
  var moved = idsToElements(from, selected);

  return {
    from: removeElements(from, moved),
    to: to.concat(moved),
  };
}

// move selected elements to the top of the array
export function top({array, selected}) {
  var moved = idsToElements(array, selected);
  array = removeElements(array, moved);

  return moved.concat(array);
}

// move selected elements to the bottom of the array
export function bottom({array, selected}) {
  var moved = idsToElements(array, selected);
  array = removeElements(array, moved);

  return array.concat(moved);
}

// move selected elements one position up
export function up({array, selected}) {
  var indexes = idsToIndexes(array, selected);
  indexes = filterIndexes(indexes);

  indexes.forEach((index) => stepUp(array, index));

  return array;
}

// move selected elements one position up
export function down({array, selected}) {
  var indexes = idsToIndexes(array, selected).reverse();
  indexes = filterReverseIndexes(indexes, array.length - 1);

  indexes.forEach((index) => stepDown(array, index));

  return array;
}
