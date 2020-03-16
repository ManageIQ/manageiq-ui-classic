import { componentTypes } from '@data-driven-forms/react-form-renderer';
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
    name: 'group1',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        name: 'genericWorkers',
        title: __('Generic Workers'),
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'generic_worker.count',
            options: injectOption(rangeNine, formValues.generic_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            name: 'generic_worker.memory_threshold',
            options: injectOption(basicOptions, formValues.generic_worker.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      }, {
        component: componentTypes.SUB_FORM,
        name: 'priorityWorkers',
        title: __('Priority Workers'),
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'priority_worker.count',
            options: injectOption(rangeNine, formValues.priority_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            name: 'priority_worker.memory_threshold',
            options: injectOption(basicOptions, formValues.priority_worker.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      },
    ],
  }, {
    component: 'dual-group',
    name: 'group3',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        name: 'cuCollectors',
        title: __('C & U Data Collectors'),
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'ems_metrics_collector_worker.defaults.count',
            options: injectOption(rangeNine, formValues.ems_metrics_collector_worker.defaults.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            name: 'ems_metrics_collector_worker.defaults.memory_threshold',
            options: injectOption(basicOptions, formValues.ems_metrics_collector_worker.defaults.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      }, {
        component: componentTypes.SUB_FORM,
        name: 'cuProccesors',
        title: __('C & U Data Processors'),
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'ems_metrics_processor_worker.count',
            options: injectOption(rangeFour, formValues.ems_metrics_processor_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            name: 'ems_metrics_processor_worker.memory_threshold',
            options: injectOption(basicOptions, formValues.ems_metrics_processor_worker.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      },
    ],
  }, {
    component: 'dual-group',
    name: 'group4',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        name: 'eventMonitor',
        title: __('Event Monitor'),
        fields: [{
          component: componentTypes.SELECT,
          name: 'event_catcher.memory_threshold',
          options: injectOption(generateRefreshOptions(false, 100, 500), formValues.event_catcher.memory_threshold),
          label: __('Memory threshold'),
        },
        ],
      }, {
        component: componentTypes.SUB_FORM,
        name: 'refresh',
        title: __('Refresh'),
        fields: [{
          component: componentTypes.SELECT,
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
    name: 'group5',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        name: 'vmAnalysisCollectors',
        title: __('VM Analysis Collectors'),
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'smart_proxy_worker.count',
            options: injectOption(rangeFive, formValues.smart_proxy_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
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
    name: 'group6',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        name: 'uiWorker',
        title: __('UI Worker'),
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'ui_worker.count',
            options: injectOption(rangeNine, formValues.ui_worker.count, true),
            label: __('Count'),
            helperText: __('Changing the UI Workers Count will immediately restart the webserver'),
          },
        ],
      }, {
        component: componentTypes.SUB_FORM,
        name: 'remoteWorkers',
        title: __('Remote Console Workers'),
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'remote_console_worker.count',
            options: injectOption(rangeNine, formValues.remote_console_worker.count, true),
            label: __('Count'),
          },
        ],
      },
    ],
  }, {
    component: 'dual-group',
    name: 'group7',
    fields: [
      {
        component: componentTypes.SUB_FORM,
        name: 'reportingWorkers',
        title: __('Reporting Workers'),
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'reporting_worker.count',
            options: injectOption(rangeNine, formValues.reporting_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
            name: 'reporting_worker.memory_threshold',
            options: injectOption(basicOptions, formValues.reporting_worker.memory_threshold),
            label: __('Memory threshold'),
          },
        ],
      }, {
        component: componentTypes.SUB_FORM,
        name: 'webServiceWorkers',
        title: __('Web Service Workers'),
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'web_service_worker.count',
            options: injectOption(rangeNine, formValues.web_service_worker.count, true),
            label: __('Count'),
          }, {
            component: componentTypes.SELECT,
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
