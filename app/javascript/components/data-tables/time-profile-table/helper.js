import { headerData, rowData } from '../../miq-data-table/helper';

/** Function to add item to array. */
export const addSelected = (array, item) => {
  if (array.indexOf(item) === -1) {
    array.push(item);
  }
  return array;
};

/** Function to remove item from an array. */
export const removeSelected = (array, item) => {
  const index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return array;
};

/** Function to generate data for time profile table. */
export const tableData = (initialData) => {
  const columns = [
    { text: 'defaultKey_0', header_text: '' },
    { text: 'description', header_text: __('Description') },
    { text: 'profile_type', header_text: __('Type') },
    { text: 'profile_key', header_text: __('Username') },
    { text: 'days', header_text: __('Days') },
    { text: 'hours', header_text: __('Hours') },
    { text: 'timezone', header_text: __('Timezone') },
    { text: 'rollup', header_text: __('Roll Up Performance') },
  ];
  const { headerKeys, headerItems } = headerData(columns, true);
  const rows = rowData(headerKeys, initialData, true);

  initialData.forEach((item) => {
    item.id = item.id.toString();
    item.clickable = true;
  });
  return { headers: headerItems, rows };
};
