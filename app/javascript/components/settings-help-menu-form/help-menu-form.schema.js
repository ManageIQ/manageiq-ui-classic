import { componentTypes } from '@@ddf';

const createSchema = (options, dropdownValue, setDropdownValue, values) => {
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
          style: { fontSize: '16px' },
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
          id: 'item_label_1',
          name: 'item_label_1',
          className: 'item-label',
          placeholder: __('Documentation'),
          initialValue: values[0].title,
          maxLength: 128,
          isRequired: true,
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
          id: 'item_label_2',
          name: 'item_label_2',
          className: 'item-label',
          placeholder: __('ManageIQ.org'),
          initialValue: values[1].title,
          maxLength: 128,
          isRequired: true,
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
          id: 'item_label_3',
          name: 'item_label_3',
          className: 'item-label',
          placeholder: __('About'),
          initialValue: values[2].title,
          maxLength: 128,
          isRequired: true,
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
          style: { fontSize: '16px' },
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
          id: 'url_1',
          name: 'url_1',
          className: 'url',
          placeholder: __('https://www.manageiq.org/docs/'),
          initialValue: values[0].href,
          maxLength: 128,
          isDisabled: dropdownValue[0] === 'modal',
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
          id: 'url_2',
          name: 'url_2',
          className: 'url',
          placeholder: __('https://www.manageiq.org'),
          maxLength: 128,
          initialValue: values[0].href,
          isDisabled: dropdownValue[1] === 'modal',
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
          id: 'url_3',
          name: 'url_3',
          className: 'url',
          maxLength: 128,
          initialValue: values[0].href,
          isDisabled: dropdownValue[2] === 'modal',
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
          style: { fontSize: '16px' },
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
          id: 'select_dropdown_1',
          name: 'select_dropdown_1',
          className: 'dropdown',
          hideLabel: true,
          options,
          maxLength: 128,
          isRequired: true,
          initialValue: dropdownValue[0],
          onChange: (value) => {
            setDropdownValue((prevValues) => {
              const updatedValues = [...prevValues];
              updatedValues[0] = value;
              return updatedValues;
            });
          },
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
          id: 'select_dropdown_2',
          name: 'select_dropdown_2',
          className: 'dropdown',
          hideLabel: true,
          options,
          initialValue: dropdownValue[1],
          maxLength: 128,
          onChange: (value) => {
            setDropdownValue((prevValues) => {
              const updatedValues = [...prevValues];
              updatedValues[1] = value;
              return updatedValues;
            });
          },
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
          id: 'select_dropdown_3',
          name: 'select_dropdown_3',
          className: 'dropdown',
          hideLabel: true,
          options,
          initialValue: dropdownValue[2],
          maxLength: 128,
          onChange: (value) => {
            setDropdownValue((prevValues) => {
              const updatedValues = [...prevValues];
              updatedValues[2] = value;
              return updatedValues;
            });
          },
        },
      ],
    },
  ];

  return {
    fields,
  };
};

export default createSchema;
