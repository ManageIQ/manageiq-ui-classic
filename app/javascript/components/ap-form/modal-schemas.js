import { componentTypes, validatorTypes } from '@@ddf';

export const createFileModalSchema = () => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'fileName',
      id: 'fileName',
      label: __('File Name'),
      placeholder: __('Enter file path'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'fileContent',
      id: 'fileContent',
      label: __('Collect Contents?'),
    },
  ],
});

export const createRegistryModalSchema = () => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'regKey',
      id: 'regKey',
      label: __('Registry Key'),
      placeholder: __('Enter registry key'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'regValue',
      id: 'regValue',
      label: __('Registry Value'),
      placeholder: __('Enter registry value'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
  ],
});

export const createEventLogModalSchema = () => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'eventLogName',
      id: 'eventLogName',
      label: __('Name'),
      placeholder: __('Enter event log name'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'eventLogMessage',
      id: 'eventLogMessage',
      label: __('Filter Message'),
      placeholder: __('Enter filter message'),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'eventLogLevel',
      id: 'eventLogLevel',
      label: __('Level'),
      placeholder: __('Enter level'),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'eventLogSource',
      id: 'eventLogSource',
      label: __('Source'),
      placeholder: __('Enter source'),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'eventLogNumDays',
      id: 'eventLogNumDays',
      label: __('# of Days'),
      placeholder: __('Enter number of days'),
      type: 'number',
    },
  ],
});
