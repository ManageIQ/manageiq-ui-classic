export const sampleData = [{
  group: 'Dataset 1',
  key: '1',
  value: 100,
},
{
  group: 'Dataset 1',
  key: '2',
  value: 400,
},
{
  group: 'Dataset 1',
  key: '4',
  value: 500,
},
{
  group: 'Dataset 1',
  key: '3',
  value: 200,
},
{
  group: 'Dataset 1',
  key: '5',
  value: 150,
},
{
  group: 'Dataset 2',
  key: '1',
  value: 280,
},
{
  group: 'Dataset 2',
  key: '2',
  value: 350,
},
{
  group: 'Dataset 2',
  key: '3',
  value: 700,
},
{
  group: 'Dataset 2',
  key: '5',
  value: 600,
},
{
  group: 'Dataset 2',
  key: '5',
  value: 200,
},
{
  group: 'Dataset 3',
  key: '4',
  value: 100,
},
{
  group: 'Dataset 3',
  key: '2',
  value: 500,
},
{
  group: 'Dataset 3',
  key: '1',
  value: 200,
}];

export const pieData = [{
  group: 'Dataset 1',
  key: '1',
  value: 100,
},
{
  group: 'Dataset 2',
  key: '1',
  value: 280,
},
{
  group: 'Dataset 3',
  key: '4',
  value: 100,
},
{
  group: 'Dataset 4',
  key: '2',
  value: 500,
}];

// convert report data to carbon chart data format.
export const getConvertedData = (data) => {
  if (data && data.data.columns && data.data && data.miq && data.miq.category_table && data.miq.name_table) {
    const columnsData = data.data.columns;
    const dataGroups = data.miq.category_table;
    const rowsData = data.miq.name_table;
    const arr = [];
    if (columnsData.length > 0) {
      columnsData.forEach((items) => {
        items.forEach((item, i) => {
          const obj = {};
          if (i !== 0 && rowsData[items[0]]) {
            obj.group = rowsData[items[0]];
            obj.key = dataGroups[i - 1];
            obj.value = item;
            arr.push(obj);
          }
        });
      });
    }
    return arr;
  }
  return [];
};

export const getLineConvertedData = (data) => {
  const columnsData = data.data.columns;
  const dataGroups = data.miq.category_table;
  const rowsData = data.miq.name_table;
  const arr = [];
  columnsData.forEach((items) => {
    items.forEach((item, i) => {
      const obj = {};
      if (i !== 0 && rowsData[items[0]]) {
        obj.group = rowsData[items[0]];
        // eslint-disable-next-line radix
        obj.key = parseInt(dataGroups[i - 1]);
        obj.value = item;
        arr.push(obj);
      }
    });
  });
  return arr;
};
