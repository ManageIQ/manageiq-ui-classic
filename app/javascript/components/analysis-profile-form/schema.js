const FAKE = {
  component: 'text-field',
  name: 'fake',
  label: 'fake',
};

const required = {
  validateOnMount: true,
  validate: [
    {
      type: 'required-validator',
    },
  ],
};

const tabCategory = {
  component: 'tab-item',
  title: __("Category"),
  fields: [
    FAKE,
  ],
};

const tabFile = {
  component: 'tab-item',
  title: __("File"),
  fields: [
    FAKE,
  ],
};

const tabRegistry = {
  component: 'tab-item',
  title: __("Registry"),
  fields: [
    FAKE,
  ],
};

const tabEventLog = {
  component: 'tab-item',
  title: __("EventLog"),
  fields: [
    FAKE,
  ],
};

function tabs(scanMode) {
  switch (scanMode) {
    case 'Host':
      return [
        tabFile,
        tabEventLog,
      ];
    case 'Vm':
      return [
        tabCategory,
        tabFile,
        tabRegistry,
        tabEventLog,
      ];
    default:
      throw `Unknown scanMode: ${scanMode}`;
  }
}

function createSchema(scanMode) {
  return {
    fields: [
      {
        component: 'header',
        label: __('Basic Information'),
      },
      {
        component: 'text-field',
        name: 'name',
        label: __('Name'),
        autoFocus: true,
        ...required,
      },
      {
        component: 'text-field',
        name: 'description',
        label: __('Description'),
        ...required,
      },
      {
        component: 'output',
        label: __('Type'),
        value: scanMode,
      },
      {
        component: 'tabs',
        fields: tabs(scanMode),
      },
    ],
  };
}

export default createSchema;
