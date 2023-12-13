import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './settings-replication-form.schema';
import { SubscriptionsTableComponent } from './helper';
import ValidateSubscription from './validate-subscription';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import mapper from '../../forms/mappers/componentMapper';
import { http } from '../../http_api';

const SettingsReplicationForm = ({ pglogicalReplicationFormId }) => {
  const [{
    initialValues, subscriptions, form, replicationHelperText, isLoading,
  }, setState] = useState({ isLoading: !!pglogicalReplicationFormId });
  const submitLabel = __('Save');

  console.log(initialValues);
  console.log(subscriptions);

  const componentMapper = {
    ...mapper,
    'subscriptions-table': SubscriptionsTableComponent,
    'validate-subscription': ValidateSubscription,
  };

  // console.log(initialValues, form);

  useEffect(() => {
    if (pglogicalReplicationFormId) {
      miqSparkleOn();
      http.get(`/ops/pglogical_subscriptions_form_fields/${pglogicalReplicationFormId}`).then((response) => {
        setState({
          initialValues: {
            replication_type: response.replication_type,
            subscriptions: response.subscriptions,
          },
          subscriptions: response.subscriptions,
          form: {
            type: 'replication',
            className: 'replication_form',
            action: 'edit',
          },
          replicationHelperText: '',
          isLoading: false,
        });
      });
      miqSparkleOff();
    }
  }, [pglogicalReplicationFormId]);

  const onSubmit = (values) => {
    if (form.type === 'subscription') {
      const newSubscriptions = [];

      newSubscriptions.push({
        dbname: values.dbname,
        host: values.host,
        user: values.user,
        password: values.password,
        port: values.port,
      });

      setState((state) => ({
        ...state,
        initialValues: {
          replication_type: state.initialValues.replication_type,
          subscriptions: state.initialValues.subscriptions,
        },
        subscriptions: subscriptions.concat(newSubscriptions),
        form: {
          type: 'replication',
          className: 'replication_form',
          action: 'edit',
        },
      }));
    } else {
      // Redirect to Settings -> Tasks

      /* http.post(`/ops/pglogical_save_subscriptions/${pglogicalReplicationFormId}?button=${'save'}`, submitData, { skipErrors: [400] }).then(() => {
        const message = __('Order Request was Submitted');
        miqRedirectBack(message, 'success', '/miq_request/show_list?typ=service/');
      }).catch((err) => {
        console.log(err);
      }); */
    }
  };

  const onCancel = () => {
    if (form.type === 'subscription') {
      setState((state) => ({
        ...state,
        form: {
          type: 'replication',
          className: 'replication_form',
          action: 'edit',
        },
      }));
    } else {
      const message = __('Dialog Cancelled');
      miqRedirectBack(message, 'warning', '/ops/explorer');
    }
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(initialValues, subscriptions, form, replicationHelperText, setState)}
      componentMapper={componentMapper}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      canReset
      buttonsLabels={{ submitLabel }}
    />
  );
};

SettingsReplicationForm.propTypes = {
  pglogicalReplicationFormId: PropTypes.string,
};
SettingsReplicationForm.defaultProps = {
  pglogicalReplicationFormId: undefined,
};

export default SettingsReplicationForm;
