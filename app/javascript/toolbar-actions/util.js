function transformResource(resource) {
  return ({ id: resource });
}

export function getGridChecks() {
  if (ManageIQ.gridChecks.length === 0) {
    return [ManageIQ.record.recordId].map(transformResource);
  }
  return ManageIQ.gridChecks.map(transformResource);
}

// If the given string has multiple values for one key, the values will overwrite each other.
// Rails has the ability to handle multi-value params if those keys are suffixed with []
// This method will divide the incoming string into key-value pairs, group all key-value
//   pairs that have the same key, then finally convert the resulting object into a new
//   param string that highlights (using []) which keys have multiple values.
export function convertMultParamsToRailsMultParams(fullParamString) {
  const keyValuePairsArr = [];
  if (fullParamString) {
    fullParamString.split('&').forEach((element) => {
      if (element) {
        keyValuePairsArr.push(element.split('='));
      }
    });
  }

  const cleanedObject = {};
  for (const pair of keyValuePairsArr) {
    if (cleanedObject[pair[0]]) {
      cleanedObject[pair.shift()].push(pair.join('%3D'));
    } else {
      cleanedObject[pair.shift()] = [pair.join('%3D')];
    }
  }

  let finalString = '';
  for (const key in cleanedObject) {
    if (cleanedObject[key].length > 1) {
      for (const value of cleanedObject[key]) {
        finalString += `${key}[]=${value}&`;
      }
    } else {
      finalString += `${key}=${cleanedObject[key][0]}&`;
    }
  }
  return finalString.slice(0, finalString.length - 1);
}
