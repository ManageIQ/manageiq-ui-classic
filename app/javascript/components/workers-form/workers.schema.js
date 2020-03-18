import { componentTypes } from '@data-driven-forms/react-form-renderer';
import {
  injectOption, generateBasicOptions, generateRange, generateRefreshOptions,
} from './helpers';

// worker counts
const range4 = generateRange(5); // 0..4
const range5 = generateRange(6); // 0..5
const range9 = generateRange(10); // 0..9

// memory thresholds
const mtBasic = generateBasicOptions(); // 200M, 250M ... 500M, 600M ... 1.5G
const mtEventCatcher = generateRefreshOptions(false, 100, 500); // 500M, 600M ... 3G, 3.5G ... 10G
const mtEmsRefresh = generateRefreshOptions(); // 200M, 250M ... 600M, 700M ... 3G, 3.5G ... 10G
const mtSmartProxy = generateRefreshOptions(true); // 200M, 250M ... 600M, 700M ... 1.9G

const workers = [
  {
    name: 'generic_worker',
    title: __('Generic Workers'),
    options: {
      count: range9,
      memory_threshold: mtBasic,
    },
  }, {
    name: 'ems_metrics_collector_worker.defaults',  // .defaults?
    title: __('C & U Data Collectors'),
    options: {
      count: range9,
      memory_threshold: mtBasic,
    },
  }, {
    name: 'event_catcher',
    title: __('Event Monitor'),
    options: {
      memory_threshold: mtEventCatcher,
    },
  }, {
    name: 'smart_proxy_worker',
    title: __('VM Analysis Collectors'),
    options: {
      count: range5,
      memory_threshold: mtSmartProxy,
    },
  }, {
    name: 'ui_worker',
    title: __('UI Worker'),
    options: {
      count: range9,
      countHelperText: __('Changing the UI Workers Count will immediately restart the webserver'),
    },
  }, {
    name: 'reporting_worker',
    title: __('Reporting Workers'),
    options: {
      count: range9,
      memory_threshold: mtBasic,
    },
  }, {
    name: 'priority_worker',
    title: __('Priority Workers'),
    options: {
      count: range9,
      memory_threshold: mtBasic,
    },
  }, {
    name: 'ems_metrics_processor_worker',
    title: __('C & U Data Processors'),
    options: {
      count: range4,
      memory_threshold: mtBasic,
    },
  }, {
    name: 'ems_refresh_worker.defaults',  // .defaults?
    title: __('Refresh'),
    options: {
      memory_threshold: mtEmsRefresh,
    },
  }, {
    name: 'remote_console_worker',
    title: __('Remote Console Workers'),
    options: {
      count: range9,
    },
  }, {
    name: 'web_service_worker',
    title: __('Web Service Workers'),
    options: {
      count: range9,
      memory_threshold: mtBasic,
    },
  }
];


const countField = ({ name, options: { count: range, countHelperText: helperText } }, formValues) => ({
  component: componentTypes.SELECT,
  name: `${name}.count`,
  options: injectOption(range, _.get(formValues, `${name}.count`), true),
  label: __('Count'),
  ...(helperText ? { helperText } : {}),  // helperText: helperText, but not there if undefined
});

const memoryThresholdField = ({ name, options: { memory_threshold: mtOptions } }, formValues) => ({
  component: componentTypes.SELECT,
  name: `${name}.memory_threshold`,
  options: injectOption(mtOptions, _.get(formValues, `${name}.memory_threshold`)),
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

function addSchema(formValues) {
  const groupOptions = {
    index: 1,
  };
  const workerForms = workers.map((worker) => workerSubForm(worker, formValues));
  const dualGroups = pairs(workerForms).map((pair) => pairGroup(_.compact(pair), groupOptions));

  return { fields: dualGroups };
}

export default addSchema;
