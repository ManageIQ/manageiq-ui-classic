import { componentTypes } from '@@ddf';

const createSchema = (domains, selectedItems, domainName, typeName, isSingleItem, isSameDomain, showOverrideExisting, domainId) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'from_domain',
      label: __('From Domain'),
      isReadOnly: true,
      initialValue: domainName,
    },
    {
      component: componentTypes.SELECT,
      name: 'domain',
      label: __('To Domain'),
      isReadOnly: domains.length === 1,
      options: domains,
      isRequired: true,
      condition: {
        when: 'domain',
        isNotEmpty: true,
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'new_name',
      label: __('New Name'),
      maxLength: 128,
      condition: {
        and: [
          { when: 'is_single_item', is: true },
          { when: 'domain', is: String(domainId) },
        ],
      },
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'override_source',
      label: __('Copy to same path'),
      initialValue: true,
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'override_existing',
      label: __('Replace items if they already exist?'),
      initialValue: false,
      condition: {
        when: 'show_override_existing',
        is: true,
      },
    },
    {
      component: 'namespace-selector',
      name: 'namespace',
      id: 'namespace',
      label: __('Namespace'),
      condition: {
        when: 'override_source',
        is: false,
      },
    },
    {
      component: 'selected-items-table',
      name: 'selected_items_table',
      selectedItems,
    },
    // Hidden fields to track state
    {
      component: componentTypes.TEXT_FIELD,
      name: 'is_single_item',
      hideField: true,
      initialValue: isSingleItem,
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'is_same_domain',
      hideField: true,
      initialValue: isSameDomain,
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'show_override_existing',
      hideField: true,
      initialValue: showOverrideExisting,
    },
  ],
});

export default createSchema;
