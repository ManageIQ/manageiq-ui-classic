import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (isHostMode, modalCallbacks) => {
  const { file, registry, eventLog } = modalCallbacks;

  const fields = [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      label: __('Name'),
      maxLength: 255,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'description',
      name: 'description',
      label: __('Description'),
      maxLength: 255,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'scan_mode',
      label: __('Type'),
      isReadOnly: true,
      isDisabled: true,
    },
  ];

  // Build tabs array based on mode
  const tabs = [];

  if (!isHostMode) {
    tabs.push({
      name: 'category',
      title: __('Category'),
      fields: [
        {
          component: 'ap-category-tab',
          name: 'category',
        },
      ],
    });
  }

  tabs.push({
    name: 'file',
    title: __('File'),
    fields: [
      {
        component: 'ap-file-tab',
        name: 'file_names',
        initialValue: [],
        validate: [],
        parse: (value) => value,
        format: (value) => value,
        onOpenModal: file.onOpenModal,
        onEditClick: file.onEditClick,
      },
    ],
  });

  if (!isHostMode) {
    tabs.push({
      name: 'registry',
      title: __('Registry'),
      fields: [
        {
          component: 'ap-registry-tab',
          name: 'reg_entries',
          initialValue: [],
          validate: [],
          onOpenModal: registry.onOpenModal,
          onEditClick: registry.onEditClick,
        },
      ],
    });
  }

  tabs.push({
    name: 'event_log',
    title: __('Event Log'),
    fields: [
      {
        component: 'ap-event-log-tab',
        name: 'nteventlog_entries',
        initialValue: [],
        validate: [],
        onOpenModal: eventLog.onOpenModal,
        onEditClick: eventLog.onEditClick,
      },
    ],
  });

  // Add tabs component
  fields.push({
    component: componentTypes.TABS,
    name: 'ap-tabs',
    fields: tabs,
  });

  return { fields };
};

export default createSchema;
