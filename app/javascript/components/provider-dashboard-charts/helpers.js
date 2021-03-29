export const getConvertedData = (data, units) => {
  if (data && data.xData && data.yData) {
    const columnsData = data.xData;
    const rowsData = data.yData;
    const arr = [];
    if (columnsData.length > 0) {
      columnsData.forEach((item, i) => {
        const obj = {};
        obj.group = units;
        obj.date = item;
        obj.value = rowsData[i];
        arr.push(obj);
      });
    }
    return arr;
  }
  return [];
};

export const getLatestValue = (data) => {
  if (data && data.yData) {
    return data.yData[data.yData.length - 1];
  }
  return 0;
};

export const getPodsData = (data, createdlabel, deletedLabel) => {
  if (data && data.xData && data.yCreated && data.yDeleted) {
    const columnsData = data.xData;
    const createdData = data.yCreated;
    const deletedData = data.yDeleted;
    const arr = [];
    if (createdData.length > 0) {
      createdData.forEach((item, i) => {
        const obj = {};
        obj.group = createdlabel;
        obj.date = columnsData[i];
        obj.value = item;
        arr.push(obj);
      });
    }
    if (deletedData.length > 0) {
      deletedData.forEach((item, i) => {
        const obj = {};
        obj.group = deletedLabel;
        obj.date = columnsData[i];
        obj.value = item;
        arr.push(obj);
      });
    }
    return arr;
  }
  return [];
};
