import { componentTypes } from '@@ddf';
import {
  injectOption, generateBasicOptions, generateRange, generateRefreshOptions,
} from './helpers';

function addSchema(formValues) {
  const basicOptions = generateBasicOptions();
  const rangeNine = generateRange(10);
  const rangeFour = generateRange(5);
  const rangeFive = generateRange(6);

  const fields = [{
    component: 'dual-group',
    id: 'group1',
    name: 'group1',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        id: 'genericWorkers',
        name: 'genericWorkers',
        title: __('Generic Workers'),
        fields: [
          {
            component: componentTypes.SELECT,
            id: 'generic_worker.count',
            name: 'generic_worker.count',
            options: injectOption(rangeNine, formValues.generic_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            id: 'generic_worker.memory_threshold',
            name: 'generic_worker.memory_threshold',
            options: injectOption(basicOptions, formValues.generic_worker.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      }, {
        component: componentTypes.SUB_FORM,
        id: 'priorityWorkers',
        name: 'priorityWorkers',
        title: __('Priority Workers'),
        fields: [
          {
            component: componentTypes.SELECT,
            id: 'priority_worker.count',
            name: 'priority_worker.count',
            options: injectOption(rangeNine, formValues.priority_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            id: 'priority_worker.memory_threshold',
            name: 'priority_worker.memory_threshold',
            options: injectOption(basicOptions, formValues.priority_worker.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      },
    ],
  }, {
    component: 'dual-group',
    id: 'group3',
    name: 'group3',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        id: 'cuCollectors',
        name: 'cuCollectors',
        title: __('C & U Data Collectors'),
        fields: [
          {
            component: componentTypes.SELECT,
            id: 'ems_metrics_collector_worker.defaults.count',
            name: 'ems_metrics_collector_worker.defaults.count',
            options: injectOption(rangeNine, formValues.ems_metrics_collector_worker.defaults.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            id: 'ems_metrics_collector_worker.defaults.memory_threshold',
            name: 'ems_metrics_collector_worker.defaults.memory_threshold',
            options: injectOption(basicOptions, formValues.ems_metrics_collector_worker.defaults.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      }, {
        component: componentTypes.SUB_FORM,
        id: 'cuProccesors',
        name: 'cuProccesors',
        title: __('C & U Data Processors'),
        fields: [
          {
            component: componentTypes.SELECT,
            id: 'ems_metrics_processor_worker.count',
            name: 'ems_metrics_processor_worker.count',
            options: injectOption(rangeFour, formValues.ems_metrics_processor_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            id: 'ems_metrics_processor_worker.memory_threshold',
            name: 'ems_metrics_processor_worker.memory_threshold',
            options: injectOption(basicOptions, formValues.ems_metrics_processor_worker.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      },
    ],
  }, {
    component: 'dual-group',
    id: 'group4',
    name: 'group4',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        id: 'eventMonitor',
        name: 'eventMonitor',
        title: __('Event Monitor'),
        fields: [{
          component: componentTypes.SELECT,
          id: 'event_catcher.memory_threshold',
          name: 'event_catcher.memory_threshold',
          options: injectOption(generateRefreshOptions(false, 100, 500), formValues.event_catcher.memory_threshold),
          label: __('Memory threshold'),
        },
        ],
      }, {
        component: componentTypes.SUB_FORM,
        id: 'refresh',
        name: 'refresh',
        title: __('Refresh'),
        fields: [{
          component: componentTypes.SELECT,
          id: 'ems_refresh_worker.defaults.memory_threshold',
          name: 'ems_refresh_worker.defaults.memory_threshold',
          options: injectOption(generateRefreshOptions(), formValues.ems_refresh_worker.defaults.memory_threshold),
          label: __('Memory threshold'),
        },
        ],
      },
    ],
  },
  {
    component: 'dual-group',
    id: 'group5',
    name: 'group5',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        id: 'vmAnalysisCollectors',
        name: 'vmAnalysisCollectors',
        title: __('VM Analysis Collectors'),
        fields: [
          {
            component: componentTypes.SELECT,
            id: 'smart_proxy_worker.count',
            name: 'smart_proxy_worker.count',
            options: injectOption(rangeFive, formValues.smart_proxy_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            id: 'smart_proxy_worker.memory_threshold',
            name: 'smart_proxy_worker.memory_threshold',
            options: injectOption(generateRefreshOptions(true), formValues.smart_proxy_worker.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      },
    ],
  },
  {
    component: 'dual-group',
    id: 'group6',
    name: 'group6',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        id: 'uiWorker',
        name: 'uiWorker',
        title: __('UI Worker'),
        fields: [
          {
            component: componentTypes.SELECT,
            id: 'ui_worker.count',
            name: 'ui_worker.count',
            options: injectOption(rangeNine, formValues.ui_worker.count, true),
            label: __('Count'),
            helperText: __('Changing the UI Workers Count will immediately restart the webserver'),
          },
        ],
      }, {
        component: componentTypes.SUB_FORM,
        id: 'remoteWorkers',
        name: 'remoteWorkers',
        title: __('Remote Console Workers'),
        fields: [
          {
            component: componentTypes.SELECT,
            id: 'remote_console_worker.count',
            name: 'remote_console_worker.count',
            options: injectOption(rangeNine, formValues.remote_console_worker.count, true),
            label: __('Count'),
          },
        ],
      },
    ],
  }, {
    component: 'dual-group',
    id: 'group7',
    name: 'group7',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        id: 'reportingWorkers',
        name: 'reportingWorkers',
        title: __('Reporting Workers'),
        fields: [
          {
            component: componentTypes.SELECT,
            id: 'reporting_worker.count',
            name: 'reporting_worker.count',
            options: injectOption(rangeNine, formValues.reporting_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            id: 'reporting_worker.memory_threshold',
            name: 'reporting_worker.memory_threshold',
            options: injectOption(basicOptions, formValues.reporting_worker.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      }, {
        component: componentTypes.SUB_FORM,
        id: 'webServiceWorkers',
        name: 'webServiceWorkers',
        title: __('Web Service Workers'),
        fields: [
          {
            component: componentTypes.SELECT,
            id: 'web_service_worker.count',
            name: 'web_service_worker.count',
            options: injectOption(rangeNine, formValues.web_service_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            id: 'web_service_worker.memory_threshold',
            name: 'web_service_worker.memory_threshold',
            options: injectOption(basicOptions, formValues.web_service_worker.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      },
    ],
  },
  ];
  return { fields };
}

export default addSchema;
