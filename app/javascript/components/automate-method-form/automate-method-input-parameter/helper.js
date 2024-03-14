/** Action buttons for the input parameter table  */
export const InputParameterButtonActions = {
  EDIT: 'editInputParameter',
  DELETE: 'deleteInputParameter',
};

export const InputParameterRecordActions = {
  OPEN: 'openModal',
  CLOSE: 'closeModal',
  ADD: 'add',
  UPDATE: 'update',
  DELETE: 'delete',
};

const editInputParameterButton = () => ({
  is_button: true,
  title: __('Edit'),
  text: __('Edit'),
  alt: __('Edit'),
  kind: 'ghost',
  callback: InputParameterButtonActions.EDIT,
});

const deleteInputParameterButton = () => ({
  is_button: true,
  title: __('Delete'),
  text: __('Delete'),
  alt: __('Delete'),
  kind: 'ghost',
  callback: InputParameterButtonActions.DELETE,
});

/** Input parameter data for table  */
export const reformatList = (items) => items.map((item, index) => ({
  ...item,
  id: index.toString(),
  edit: editInputParameterButton(item, index),
  delete: deleteInputParameterButton(item, index),
}));

export const headers = [
  { key: 'inputName', header: __('Input Name') },
  { key: 'dataType', header: __('Data Type') },
  { key: 'defaultValue', header: __('Default Value') },
  { key: 'edit', header: __('Edit') },
  { key: 'delete', header: __('Delete') },
];

/* Function to handle the action buttons  */
export const handleInputParameterUpdate = (actionType, data, formData) => {
  const { inputParameter } = formData;

  if (actionType !== InputParameterRecordActions.DELETE) {
    inputParameter.modal = false;
  }

  switch (actionType) {
    case InputParameterRecordActions.OPEN:
      inputParameter.modal = true;
      if (data && data.selectedId) {
        inputParameter.selectedId = data.selectedId;
      }
      break;
    case InputParameterRecordActions.CLOSE:
      inputParameter.modal = false;
      inputParameter.selectedId = undefined;
      break;
    case InputParameterRecordActions.ADD:
      inputParameter.items.push(data.values);
      inputParameter.selectedId = undefined;
      break;
    case InputParameterRecordActions.UPDATE:
      inputParameter.items[inputParameter.selectedId] = data.values;
      inputParameter.selectedId = undefined;
      break;
    case InputParameterRecordActions.DELETE:
      inputParameter.items.splice(data.selectedId, 1);
      inputParameter.selectedId = undefined;
      break;
    default:
      console.warn(__('Unknown action'));
  }

  return { ...formData.inputParameter };
};

/** Helper function to get provider details and restructure its options */
export const initialState = {
  manager_id: null,
};

export const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MANAGER_ID':
      return {
        ...state,
        manager_id: action.payload,
      };
    default:
      return state;
  }
};
