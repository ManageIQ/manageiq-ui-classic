const createSchema = () => ({
  fields: [
    {
      component: 'code-editor',
      id: 'fileData',
      name: 'fileData',
      mode: 'yaml',
      isRequired: true,
    },
  ],
});

export default createSchema;
