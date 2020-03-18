import { componentTypes } from '@data-driven-forms/react-form-renderer';
import {
  injectOption, generateBasicOptions, generateRange, generateRefreshOptions,
} from './helpers';

const workerCounts = {
  'range4': generateRange(5), // 0..4
  'range5': generateRange(6), // 0..5
  'range9': generateRange(10), // 0..9
};

const memoryThresholds = {
  'basic': generateBasicOptions(), // 200M, 250M ... 500M, 600M ... 1.5G
  'event_catcher': generateRefreshOptions(false, 100, 500), // 500M, 600M ... 3G, 3.5G ... 10G
  'ems_refresh': generateRefreshOptions(), // 200M, 250M ... 600M, 700M ... 3G, 3.5G ... 10G
  'smart_proxy': generateRefreshOptions(true), // 200M, 250M ... 600M, 700M ... 1.9G
};

export const workers = [
  {
    name: 'generic_worker',
    prefix: 'queue_worker_base',
    title: __('Generic Workers'),
    options: {
      count: 'range9',
      memory_threshold: 'basic',
      default_threshold: 'queue_worker_base',
    },
  }, {
    name: 'ems_metrics_collector_worker.defaults',  // .defaults?
    prefix: 'queue_worker_base',
    title: __('C & U Data Collectors'),
    options: {
      count: 'range9',
      memory_threshold: 'basic',
      default_threshold: 'queue_worker_base',
    },
  }, {
    name: 'event_catcher',
    title: __('Event Monitor'),
    options: {
      memory_threshold: 'event_catcher',
      default_threshold: 'event_catcher',
    },
  }, {
    name: 'smart_proxy_worker',
    prefix: 'queue_worker_base',
    title: __('VM Analysis Collectors'),
    options: {
      count: 'range5',
      memory_threshold: 'smart_proxy',
      default_threshold: 'queue_worker_base',
    },
  }, {
    name: 'ui_worker',
    title: __('UI Worker'),
    options: {
      count: 'range9',
      countHelperText: __('Changing the UI Workers Count will immediately restart the webserver'),
    },
  }, {
    name: 'reporting_worker',
    prefix: 'queue_worker_base',
    title: __('Reporting Workers'),
    options: {
      count: 'range9',
      memory_threshold: 'basic',
      default_threshold: 'queue_worker_base',
    },
  }, {
    name: 'priority_worker',
    prefix: 'queue_worker_base',
    title: __('Priority Workers'),
    options: {
      count: 'range9',
      memory_threshold: 'basic',
      default_threshold: 'queue_worker_base',
    },
  }, {
    name: 'ems_metrics_processor_worker',
    prefix: 'queue_worker_base',
    title: __('C & U Data Processors'),
    options: {
      count: 'range4',
      memory_threshold: 'basic',
      default_threshold: 'queue_worker_base',
    },
  }, {
    name: 'ems_refresh_worker.defaults',  // .defaults?
    prefix: 'queue_worker_base',
    title: __('Refresh'),
    options: {
      memory_threshold: 'ems_refresh',
      default_threshold: 'queue_worker_base',
    },
  }, {
    name: 'remote_console_worker',
    title: __('Remote Console Workers'),
    options: {
      count: 'range9',
    },
  }, {
    name: 'web_service_worker',
    title: __('Web Service Workers'),
    options: {
      count: 'range9',
      memory_threshold: 'basic',
      default_threshold: 'defaults',
    },
  }
];


const countField = ({ name, options: { count: range, countHelperText: helperText } }, formValues) => ({
  component: componentTypes.SELECT,
  name: `${name}.count`,
  options: injectOption(workerCounts[range], _.get(formValues, `${name}.count`), true),
  label: __('Count'),
  ...(helperText ? { helperText } : {}),  // helperText: helperText, but not there if undefined
});

const memoryThresholdField = ({ name, options: { memory_threshold: mtOptions } }, formValues) => ({
  component: componentTypes.SELECT,
  name: `${name}.memory_threshold`,
  options: injectOption(memoryThresholds[mtOptions], _.get(formValues, `${name}.memory_threshold`)),
  label: __('Memory threshold'),
});


const workerSubForm = (worker, formValues) => ({
  component: componentTypes.SUB_FORM,
  name: worker.name,
  title: worker.title,
  fields: _.compact([
    worker.options.count && countField(worker, formValues),
    worker.options.memory_threshold && memoryThresholdField(worker, formValues),
  ]),
});

// [ a, b, c, d, e ] -> [ [ a, d ], [ b, e ], [ c, undefined ] ]
const pairs = (array) => {
  let [left, right] = _.chunk(array, Math.ceil(array.length / 2));
  return _.zip(left, right);
};

const pairGroup = (fields, groupOptions) => ({
  component: 'dual-group',
  name: `group${groupOptions.index++}`,
  fields,
});

export function addSchema(formValues) {
  const groupOptions = {
    index: 1,
  };
  const workerForms = workers.map((worker) => workerSubForm(worker, formValues));
  const dualGroups = pairs(workerForms).map((pair) => pairGroup(_.compact(pair), groupOptions));

  return { fields: dualGroups };
}
