import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import { get } from 'lodash';
import addSchema from './workers.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { API } from '../../http_api';
import {
  toBytes, parseWorker, buildPatch, toRubyMethod,
} from './helpers';

const WorkersForm = ({ server: { id, name }, product, zone }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [schema, setSchema] = useState({});
  const [initialValues, setInitialValues] = useState({});

  useEffect(() => {
    miqSparkleOn();
    API.get(`/api/servers/${id}/settings`)
      .then(({ workers }) => {
        const baseCount = workers.worker_base.count;
        const baseMem = toBytes(workers.worker_base.memory_threshold);
        const queueMem = toBytes(workers.queue_worker_base.memory_threshold) || baseMem;
        const eventCatcherMem = toBytes(workers.event_catcher.memory_threshold) || baseMem;

        const selectCount = value => (typeof value === 'number' ? value : baseCount);

        const parsedValues = {
          generic_worker: {
            memory_threshold: parseWorker(workers.generic_worker).bytes || queueMem,
            count: selectCount(workers.generic_worker.count),
          },
          priority_worker: {
            memory_threshold: parseWorker(workers.priority_worker).bytes || queueMem,
            count: selectCount(workers.priority_worker.count),
          },
          ems_metrics_collector_worker: {
            memory_threshold: parseWorker(workers.ems_metrics_collector_worker).bytes || queueMem,
            count: selectCount(workers.ems_metrics_collector_worker.count),
          },
          ems_metrics_processor_worker: {
            memory_threshold: parseWorker(workers.ems_metrics_processor_worker).bytes || queueMem,
            count: selectCount(workers.ems_metrics_processor_worker.count),
          },
          event_catcher: {
            memory_threshold: parseWorker(workers.event_catcher).bytes || eventCatcherMem,
          },
          ems_refresh_worker: {
            memory_threshold: parseWorker(workers.ems_refresh_worker).bytes || queueMem,
          },
          smart_proxy_worker: {
            memory_threshold: parseWorker(workers.smart_proxy_worker).bytes || queueMem,
            count: selectCount(workers.smart_proxy_worker.count),
          },
          ui_worker: {
            count: selectCount(workers.ui_worker.count),
          },
          reporting_worker: {
            memory_threshold: parseWorker(workers.reporting_worker).bytes || queueMem,
            count: selectCount(workers.reporting_worker.count),
          },
          web_service_worker: {
            memory_threshold: parseWorker(workers.web_service_worker).bytes || baseMem,
            count: selectCount(workers.web_service_worker.count),
          },
          remote_console_worker: {
            count: selectCount(workers.remote_console_worker.count),
          },
        };

        setInitialValues(parsedValues);

        setSchema(() => addSchema(parsedValues));

        setIsLoading(false);

        miqSparkleOff();
      })
      .catch(
        ({ error: { message } = { message: __('Could not fetch the data') } }) => {
          add_flash(message, 'error');
          miqSparkleOff();
        },
      );
  }, []);

  const onSubmit = (values) => {
    // Compares initialValues and values and returns the value only if it's different
    const isDifferent = name => (get(initialValues, name) !== get(values, name) ? get(values, name) : undefined);

    miqSparkleOn();
    const result = {
      generic_worker: {
        memory_threshold: toRubyMethod(isDifferent('generic_worker.memory_threshold')),
        count: isDifferent('generic_worker.count'),
      },
      priority_worker: {
        memory_threshold: toRubyMethod(isDifferent('priority_worker.memory_threshold')),
        count: isDifferent('priority_worker.count'),
      },
      ems_metrics_processor_worker: {
        memory_threshold: toRubyMethod(isDifferent('ems_metrics_processor_worker.memory_threshold')),
        count: isDifferent('ems_metrics_processor_worker.count'),
      },
      smart_proxy_worker: {
        memory_threshold: toRubyMethod(isDifferent('smart_proxy_worker.memory_threshold')),
        count: isDifferent('smart_proxy_worker.count'),
      },
      ems_metrics_collector_worker: {
        memory_threshold: toRubyMethod(isDifferent('ems_metrics_collector_worker.memory_threshold')),
        count: isDifferent('ems_metrics_collector_worker.count'),
      },
      ems_refresh_worker: {
        memory_threshold: toRubyMethod(isDifferent('ems_refresh_worker.memory_threshold')),
      },
      reporting_worker: {
        memory_threshold: toRubyMethod(isDifferent('reporting_worker.memory_threshold')),
        count: isDifferent('reporting_worker.count'),
      },
      remote_console_worker: {
        count: isDifferent('remote_console_worker.count'),
      },
      web_service_worker: {
        memory_threshold: toRubyMethod(isDifferent('web_service_worker.memory_threshold')),
        count: isDifferent('web_service_worker.count'),
      },
      ui_worker: {
        count: isDifferent('ui_worker.count'),
      },
      event_catcher: {
        memory_threshold: toRubyMethod(isDifferent('event_catcher.memory_threshold')),
      },
    };

    const patch = {
      workers: {
        ...buildPatch(result),
      },
    };

    return API.patch(`/api/servers/${id}/settings`, patch)
      .then(
        () => {
          const message = sprintf(__('Configuration settings saved for %s Server "%s [%s]" in Zone "%s"'), product, name, id, zone);
          add_flash(message, 'success');
          setInitialValues(values);
          miqSparkleOff();
        },
      )
      .catch(
        ({ error: { message } = { message: __('Unknown error') } }) => {
          add_flash(message, 'error');
          miqSparkleOff();
        },
      );
  };

  if (isLoading) {
    return null;
  }

  return (
    <Grid fluid style={{ marginBottom: 16 }}>
      <MiqFormRenderer
        initialValues={initialValues}
        schema={schema}
        onSubmit={onSubmit}
        buttonsLabels={{
          submitLabel: __('Save'),
        }}
        canReset
        className=""
      />
    </Grid>
  );
};

WorkersForm.propTypes = {
  server: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
  }).isRequired,
  product: PropTypes.string.isRequired,
  zone: PropTypes.string.isRequired,
};

export default WorkersForm;
