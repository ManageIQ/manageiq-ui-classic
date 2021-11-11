const buildModeOptions = (mode) => {
  const modeArray = [];
  mode.forEach((pt) => {
    const tempObj = { label: pt[0], value: pt[1] };
    modeArray.push(tempObj);
  });
  return modeArray;
};

const findLabel = (emsId, mode) => {
  let titleLabel = [];
  emsId.forEach((pt) => {
    const tempObj = { label: pt[0], value: pt[1] };
    if (tempObj.value === mode) {
      titleLabel = tempObj.label;
    }
  });
  return titleLabel;
};

const changeTitle = (emsId, mode) => {
  const titleName = findLabel(mode, emsId);
  const title = _(`Available ${titleName} Alerts`);
  return title;
};

export {
  buildModeOptions, changeTitle,
};
