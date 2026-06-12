import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (domains, existingDomains, getNamespacesForDomain) => {
  const importFromDomainOptions = domains.map((domain) => ({
    label: domain.text,
    value: domain.text,
  }));

  const importToDomainOptions = existingDomains.map((domainName) => ({
    label: domainName,
    value: domainName,
  }));

  return {
    fields: [
      {
        component: componentTypes.SELECT,
        id: 'selected_domain_to_import_to',
        name: 'selected_domain_to_import_to',
        label: __('Import to Existing Domain'),
        isRequired: true,
        validateOnMount: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        options: importToDomainOptions,
        includeEmpty: false,
        isSearchable: true,
      },
      {
        component: componentTypes.SELECT,
        id: 'selected_domain_to_import_from',
        name: 'selected_domain_to_import_from',
        label: __('Import from Domain'),
        isRequired: true,
        validateOnMount: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        options: importFromDomainOptions,
        includeEmpty: false,
        isSearchable: true,
      },
      {
        component: 'sub-form',
        id: 'namespace-selection',
        name: 'namespace-selection',
        title: __('Select Namespaces to Import'),
        fields: [
          {
            component: 'namespace-tree-checkbox',
            id: 'selected_namespaces',
            name: 'selected_namespaces',
            showSelectButtons: true,
            showSelectionCount: true,
            transformNodes: true,
            emptyMessage: __('No namespaces available for the selected domain'),
            resolveProps: (props, _field, formOptions) => {
              const selectedDomain = formOptions.getState().values.selected_domain_to_import_from;
              // Extract value if it's an object (from dropdown), otherwise use as-is (initial string value)
              const domainName = typeof selectedDomain === 'object' ? selectedDomain.value : selectedDomain;
              return {
                ...props,
                nodes: getNamespacesForDomain(domainName),
              };
            },
            validate: [{
              type: validatorTypes.REQUIRED,
              message: __('Please select at least one namespace to import'),
            }],
          },
        ],
      },
    ],
  };
};

export default createSchema;
