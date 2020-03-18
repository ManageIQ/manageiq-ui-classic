/**
 * Converts any value to bytes values.
 *
 * @param {any} value Input value.
 * @return {number} Value in bytes.
 */
export const toBytes = (value) => {
  if (!value) return undefined;

  if (typeof value !== 'number') {
    const sizeValue = value.match(/^\d+(\.\d+)*/)[0];
    if (value.match(/gigabytes/)) {
      return sizeValue * (1024 ** 3);
    }
    if (value.match(/megabytes/)) {
      return sizeValue * (1024 ** 2);
    }
    if (value.match(/kilobytes/)) {
      return sizeValue * 1024;
    }
    if (value.match(/\.bytes/)) {
      return Number(sizeValue);
    }
  }
  return value;
};

/**
 * Converts any value to human readable values.
 *
 * @param {any} value Input value.
 * @return {string} Value in human readable format (500 MB, 2 GB, etc.).
 */
export const toHumanSize = (value) => {
  if (!value) return undefined;

  if (value >= 1073741824) {
    return `${value / (1024 ** 3)} GB`;
  } if (value >= 1048576) {
    return `${value / (1024 ** 2)} MB`;
  } if (value >= 1024) {
    return `${value / 1024} KB`;
  } if (value >= 0) {
    return `${value} B`;
  }
  return value
    .replace('.gigabytes', ' GB')
    .replace('.megabytes', ' MB')
    .replace('.kilobytes', ' KB')
    .replace('.bytes', ' B');
};

/**
 * Converts any value to ruby format values.
 *
 * @param {any} value Input value.
 * @return {string} Value in ruby method format (3.megabytes, 2.gigabytes, etc.).
 */
export const toRubyMethod = (value) => {
  if (!value) return undefined;

  if (value >= 1073741824) {
    return `${value / (1024 ** 3)}.gigabytes`;
  } if (value >= 1048576) {
    return `${value / (1024 ** 2)}.megabytes`;
  } if (value >= 1024) {
    return `${value / 1024}.kilobytes`;
  } if (value >= 0) {
    return `${value}.bytes`;
  }
  return value;
};

/**
 * Checks if node is empty.
 *
 * @param {any} parent Input node/object/value.
 * @return {boolean} True if empty, false if not empty.
 */
export const emptyChildren = (parent) => {
  if (typeof parent === 'number' || typeof parent === 'string') return false;
  if (!parent) return true;
  return Object.keys(parent).map(key => emptyChildren(parent[key]))
    .reduce((acc, curr) => acc && curr, [true]);
};

/**
 * Converts object to object with no empty values.
 *
 * @param {object} parent object/value.
 * @return {object} Object with no empty children.
 */
export const buildPatch = (parent) => {
  if (typeof parent === 'number' || typeof parent === 'string') return parent;
  const result = {};
  Object.keys(parent).forEach((key) => {
    if (!emptyChildren(parent[key])) {
      result[key] = buildPatch(parent[key]);
    }
  });
  return result;
};

/**
 * Create number range options.
 *
 * @param {number} length 0 .. lenght.
 * @return {array} Array of {value: 0, label: "0"}, {value: 1, label: "1"}, ... {value: lenght, label: 'length'}.
 */
export const generateRange = length => [...Array(length)].map((_number, index) => ({
  value: index,
  label: `${index}`,
}));

/** Generate basic options for MemoryThreshold selects
 *  200,250,300 ...550 MB
 *  600,700, ...900 MB
 *  1, 1.1, ...1.5 GB
 */
export const generateBasicOptions = () => {
  let index = 200;
  let step = 50;
  const options = [];
  while (index < 1000) {
    const valueInMb = index * 1024 * 1024;
    options.push({
      value: valueInMb,
      label: toHumanSize(valueInMb),
    });
    if (index >= 600) {
      step = 100;
    }
    index += step;
  }
  index = 1;
  step = 0.1;
  while (index <= 1.55) {
    const valueInGB = Math.round((index * 1024 * 1024 * 1024) * 10) / 10;
    options.push({
      value: valueInGB,
      label: toHumanSize(valueInGB),
    });
    index += step;
  }
  return options;
};

/** Generate customizable options for MemoryThreshold selects
  * initialIndex (200) + initialStep ...600 MB
  * 600, 700, ...900 MB
  * 1, 1.1, ... 3 GB
  * 3.5, 4, 4.5, ...10 GB (if not constrained)
  * @param {boolean} constrained If true, it will skip values above 3 GB.
  * @param {number} initialStep Value of initial step.
  * @param {number} initialIndex Value of initial index.
  */
export const generateRefreshOptions = (constrained = false, initialStep = 50, initialIndex = 200) => {
  let index = initialIndex;
  let step = initialStep;
  const options = [];
  while (index < 1000) {
    const valueInMb = index * 1024 * 1024;
    options.push({
      value: valueInMb,
      label: toHumanSize(valueInMb),
    });
    if (index >= 600) {
      step = 100;
    }
    index += step;
  }
  index = 1;
  step = 0.1;
  while (index <= 2.99) {
    const valueInGB = Math.round((index * 1024 * 1024 * 1024) * 10) / 10;
    options.push({
      value: valueInGB,
      label: toHumanSize(valueInGB),
    });
    index += step;
  }
  index = 3;
  step = 0.5;
  while (index <= 10 && !constrained) {
    const valueInGB = Math.round((index * 1024 * 1024 * 1024) * 10) / 10;
    options.push({
      value: valueInGB,
      label: toHumanSize(valueInGB),
    });
    index += step;
  }
  return options;
};

/**
 * Inject a custom initial value into options and sorts it, if the value is not included.
 *
 * @param {array} options Array of current options.
 * @param {number} initialValue Initial value.
 * @param {boolean} isCount Disables formatting of label into human readable format.
 * @return {array} Array of sorted options with initial value.
 */
export const injectOption = (options, initialValue, isCount = false) => {
  if (!initialValue) {
    return options;
  }
  const values = options.map(({ value }) => value);

  if (!values.includes(initialValue)) {
    return [
      ...options,
      {
        label: isCount ? `${initialValue} (${__('Custom')})` : `${toHumanSize(initialValue)} (${__('Custom')})`,
        value: initialValue,
      },
    ].sort((a, b) => {
      if (a.value < b.value) return -1;
      if (a.value > b.value) return 1;
      return 0;
    });
  }
  return options;
};

// parse /api/servers/:id/settings output
export const parseSettings = ({ workers: { worker_base: wb } }) => {
  const workerCount = (worker) => (typeof worker.count === 'number') && worker.count;
  const workerBytes = (worker) => toBytes(worker.memory_threshold);

  const countDefault = wb.defaults.count;
  const count = (path) => (_.get(wb, path) && workerCount(_.get(wb, path)) || countDefault);

  const memDefault = toBytes(wb.defaults.memory_threshold);
  const bytes = (path, defaultValue = memDefault) => (_.get(wb, path) && workerBytes(_.get(wb, path)) || defaultValue);

  const baseMemDefault = bytes('queue_worker_base.defaults');
  const monitorDefault = bytes('event_catcher.defaults');

  return {
    generic_worker: {
      memory_threshold: bytes('queue_worker_base.generic_worker', baseMemDefault),
      count: count('queue_worker_base.generic_worker'),
    },
    priority_worker: {
      memory_threshold: bytes('queue_worker_base.priority_worker', baseMemDefault),
      count: count('queue_worker_base.priority_worker'),
    },
    ems_metrics_collector_worker: {
      defaults: {
        memory_threshold: bytes('queue_worker_base.ems_metrics_collector_worker.defaults', baseMemDefault),
        count: count('queue_worker_base.ems_metrics_collector_worker.defaults'),
      },
    },
    ems_metrics_processor_worker: {
      memory_threshold: bytes('queue_worker_base.ems_metrics_processor_worker', baseMemDefault),
      count: count('queue_worker_base.ems_metrics_processor_worker'),
    },
    event_catcher: {
      memory_threshold: bytes('event_catcher', monitorDefault),
    },
    ems_refresh_worker: {
      defaults: {
        memory_threshold: bytes('queue_worker_base.ems_refresh_worker.defaults', baseMemDefault),
      },
    },
    smart_proxy_worker: {
      memory_threshold: bytes('queue_worker_base.smart_proxy_worker', baseMemDefault),
      count: count('queue_worker_base.smart_proxy_worker'),
    },
    ui_worker: {
      count: count('ui_worker'),
    },
    reporting_worker: {
      memory_threshold: bytes('queue_worker_base.reporting_worker', baseMemDefault),
      count: count('queue_worker_base.reporting_worker'),
    },
    web_service_worker: {
      memory_threshold: bytes('web_service_worker', memDefault),
      count: count('web_service_worker'),
    },
    remote_console_worker: {
      count: count('remote_console_worker'),
    },
  };
};
