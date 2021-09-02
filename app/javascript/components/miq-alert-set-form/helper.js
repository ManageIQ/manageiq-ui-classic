const buildModeOptions = (parentType) => {
  const parentTypeArray = [];
  parentType.forEach((pt) => {
    const tempObj = { label: pt[0], value: pt[1] };
    parentTypeArray.push(tempObj);
  });
  return parentTypeArray;
};

export {
  buildModeOptions,
};
