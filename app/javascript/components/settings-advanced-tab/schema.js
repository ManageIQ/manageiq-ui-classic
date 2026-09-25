const createSchema = () => ({
  fields: [
    {
      component: 'code-editor',
      id: 'fileData',
      name: 'fileData',
      mode: 'yaml',
      showSearch: true,
      isRequired: true,
    },
  ],
});

export default createSchema;
