function createSchema(maxNameLen, maxDescLen) {
  return {
    fields: [{
      component: 'text-field',
      name: 'name',
      maxLength: maxNameLen,
      label: __('Name'),
      validateOnMount: true,
      autoFocus: true,
      validate: [{
        type: 'required-validator',
      }],
    }, {
      component: 'text-field',
      name: 'description',
      maxLength: maxDescLen,
      label: __('Description'),
      validateOnMount: true,
      autoFocus: true,
    }],
  };
}

export default createSchema;
