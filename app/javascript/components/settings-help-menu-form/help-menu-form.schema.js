import { componentTypes } from '@@ddf';

const createSchema = (options, values, defaults = {}) => {
  const optionsWithoutModal = options.filter((o) => o.value !== 'modal');

  const doc   = (values && values.documentation) || {};
  const prod  = (values && values.product)       || {};
  const about = (values && values.about)         || {};

  const fields = [
    {
      component: componentTypes.SUB_FORM,
      id: 'col1',
      name: 'col1',
      className: 'col1',
      fields: [
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'menu_item_label',
          name: 'menu_item_label',
          className: 'menu-item-label',
          label: __('Menu item label'),
        },
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'divider_2',
          name: 'divider_2',
          label: '',
          className: 'left-divider',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'documentation_title',
          name: 'documentation_title',
          className: 'item-label',
          placeholder: __('Documentation'),
          initialValue: doc.title,
          maxLength: 128,
        },
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'divider_3',
          name: 'divider_3',
          label: '',
          className: 'left-divider',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'product_title',
          name: 'product_title',
          className: 'item-label',
          placeholder: defaults.product_support_website_text || 'ManageIQ.org',
          initialValue: prod.title,
          maxLength: 128,
        },
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'divider_4',
          name: 'divider_4',
          label: '',
          className: 'left-divider',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'about_title',
          name: 'about_title',
          className: 'item-label',
          placeholder: __('About'),
          initialValue: about.title,
          maxLength: 128,
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'col2',
      name: 'col2',
      className: 'col2',
      fields: [
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'url_label',
          name: 'url_label',
          className: 'url-label',
          label: __('URL'),
        },
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'divider_5',
          name: 'divider_5',
          label: '',
          className: 'middle-divider',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'documentation_url',
          name: 'documentation_url',
          className: 'url',
          placeholder: defaults.product_documentation_website || 'https://www.manageiq.org/docs/',
          initialValue: doc.url,
          maxLength: 128,
        },
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'divider_6',
          name: 'divider_6',
          label: '',
          className: 'middle-divider',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'product_url',
          name: 'product_url',
          className: 'url',
          placeholder: defaults.product_support_website || 'https://www.manageiq.org',
          initialValue: prod.url,
          maxLength: 128,
        },
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'divider_7',
          name: 'divider_7',
          label: '',
          className: 'middle-divider',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'about_url',
          name: 'about_url',
          className: 'url',
          maxLength: 128,
          initialValue: about.url,
          isRequired: true,
          // Disable the URL field when "About Modal" is selected.
          resolveProps: (_props, _field, { getState }) => ({
            disabled: getState().values.about_type === 'modal',
          }),
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'col3',
      name: 'col3',
      className: 'col3',
      fields: [
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'open_label',
          name: 'open_label',
          className: 'open-label',
          label: __('Open in'),
        },
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'divider_8',
          name: 'divider_8',
          label: '',
          className: 'right-divider',
        },
        {
          component: componentTypes.SELECT,
          id: 'documentation_type',
          name: 'documentation_type',
          className: 'dropdown',
          hideLabel: true,
          options: optionsWithoutModal,
          isRequired: true,
          initialValue: doc.type,
        },
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'divider_9',
          name: 'divider_9',
          label: '',
          className: 'right-divider',
        },
        {
          component: componentTypes.SELECT,
          id: 'product_type',
          name: 'product_type',
          className: 'dropdown',
          hideLabel: true,
          options: optionsWithoutModal,
          initialValue: prod.type,
        },
        {
          component: componentTypes.PLAIN_TEXT,
          id: 'divider_10',
          name: 'divider_10',
          label: '',
          className: 'right-divider',
        },
        {
          component: componentTypes.SELECT,
          id: 'about_type',
          name: 'about_type',
          className: 'dropdown',
          hideLabel: true,
          options,
          initialValue: about.type,
        },
      ],
    },
  ];

  return { fields };
};

export default createSchema;
