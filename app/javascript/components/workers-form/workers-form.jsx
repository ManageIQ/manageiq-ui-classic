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
      // eslint-disable-next-line camelcase
      .then(({ workers: { worker_base } }) => {
        // eslint-disable-next-line camelcase
        const wb = worker_base;

        const baseCount = wb.defaults.count;
        const queueCount = wb.queue_worker_base.defaults.count || baseCount;
        const baseMem = toBytes(wb.defaults.memory_threshold);
        const queueMem = toBytes(wb.queue_worker_base.defaults.memory_threshold) || baseMem;

        const parsedValues = {
          generic_worker: {
            memory_threshold: parseWorker(wb.queue_worker_base.generic_worker).bytes || queueMem,
            count: wb.queue_worker_base.generic_worker.count || queueCount,
          },
          priority_worker: {
            memory_threshold: parseWorker(wb.queue_worker_base.priority_worker).bytes || queueMem,
            count: wb.queue_worker_base.priority_worker.count || queueCount,
          },
          ems_metrics_collector_worker: {
            defaults: {
              memory_threshold: parseWorker(wb.queue_worker_base.ems_metrics_collector_worker.defaults).bytes || queueMem,
              count: wb.queue_worker_base.ems_metrics_collector_worker.defaults.count || queueCount,
            },
          },
          ems_metrics_processor_worker: {
            memory_threshold: parseWorker(wb.queue_worker_base.ems_metrics_processor_worker).bytes || queueMem,
            count: wb.queue_worker_base.ems_metrics_processor_worker.count || queueCount,
          },
          event_catcher: {
            memory_threshold: parseWorker(wb.event_catcher.defaults).bytes || baseMem,
          },
          ems_refresh_worker: {
            defaults: {
              memory_threshold: parseWorker(wb.queue_worker_base.ems_refresh_worker.defaults).bytes || queueMem,
            },
          },
          smart_proxy_worker: {
            memory_threshold: parseWorker(wb.queue_worker_base.smart_proxy_worker).bytes || queueMem,
            count: wb.queue_worker_base.smart_proxy_worker.count || queueCount,
          },
          ui_worker: {
            count: wb.ui_worker.count || baseCount,
          },
          reporting_worker: {
            memory_threshold: parseWorker(wb.queue_worker_base.reporting_worker).bytes || queueMem,
            count: wb.queue_worker_base.reporting_worker.count || queueCount,
          },
          web_service_worker: {
            memory_threshold: parseWorker(wb.web_service_worker).bytes || baseMem,
            count: wb.web_service_worker.count || baseCount,
          },
          remote_console_worker: {
            count: wb.remote_console_worker.count || baseCount,
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
    const isDifferent = (name) => (get(initialValues, name) !== get(values, name) ? get(values, name) : undefined);

    miqSparkleOn();
    const result = {
      queue_worker_base: {
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
          defaults: {
            memory_threshold: toRubyMethod(isDifferent('ems_metrics_collector_worker.defaults.memory_threshold')),
            count: isDifferent('ems_metrics_collector_worker.defaults.count'),
          },
        },
        ems_refresh_worker: {
          defaults: {
            memory_threshold: toRubyMethod(isDifferent('ems_refresh_worker.defaults.memory_threshold')),
          },
        },
        reporting_worker: {
          memory_threshold: toRubyMethod(isDifferent('reporting_worker.memory_threshold')),
          count: isDifferent('reporting_worker.count'),
        },
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
        worker_base: {
          ...buildPatch(result),
        },
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
