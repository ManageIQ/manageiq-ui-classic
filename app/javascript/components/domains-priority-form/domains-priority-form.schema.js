import { validatorTypes } from '@@ddf';

const createSchema = (domainOrder) => ({
  fields: [
    {
      component: 'sortable-list',
      id: 'domain_order',
      name: 'domain_order',
      label: __('Domains:'),
      helperText: __('Drag and drop to reorder domains. Higher priority domains are listed first.'),
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
      initialValue: domainOrder,
    },
  ],
});

export default createSchema;
