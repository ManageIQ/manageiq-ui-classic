function createSchema(maxNameLen, maxDescLen) {
  return {
    fields: [{
      component: 'text-field',
      name: 'name',
      maxLength: maxNameLen,
      label: __('Name'),
      isRequired: true,
      autoFocus: true,
      validate: [{
        type: 'required-validator',
      }],
    }, {
      component: 'text-field',
      name: 'description',
      maxLength: maxDescLen,
      label: __('Description'),
      isRequired: true,
      autoFocus: true,
      validate: [{
        type: 'required-validator',
      }],
    }],
  };
}

export default createSchema;
