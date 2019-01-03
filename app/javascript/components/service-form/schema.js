function createSchema() {
  return {
    fields: [
      {
        component: 'text-field',
        name: 'name',
        maxLength: ManageIQ.ViewHelper.MAX_NAME_LEN,
        label: __('Name'),
        validateOnMount: true,
        autoFocus: true,
        validate: [{
          type: 'required-validator',
        }],
      },
      {
        component: 'text-field',
        name: 'description',
        maxLength: ManageIQ.ViewHelper.MAX_DESC_LEN,
        label: __('Description'),
        validateOnMount: true,
        validate: [{
          type: 'required-validator',
        }],
      },
    ],
  };
}

export default createSchema;
