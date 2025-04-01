import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import { Modal } from 'carbon-components-react';
// import { Button } from 'carbon-components-react';
// import MiqDataTable from '../miq-data-table';
import createSchema from './settings-replication-form.schema';
import createSubscriptionSchema from './modal-form.schema';
import { SubscriptionsTableComponent } from './subscriptions-table';
import ValidateSubscription from './validate-subscription';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import mapper from '../../forms/mappers/componentMapper';
import { http } from '../../http_api';

const SettingsReplicationForm = ({ pglogicalReplicationFormId }) => {
  const [{
    initialValues, subscriptions, form, replicationHelperText,
    isLoading, replicationType, selectedRowId, selectedSubscription,
  }, setState] = useState(
    {
      isLoading: !!pglogicalReplicationFormId,
      selectedSubscription: {},
    }
  );
  const submitLabel = __('Save');

  const [isModalOpen, setModalOpen] = useState(false);

  const handleModalClose = () => {
    setModalOpen(false);
    setState((state) => ({ ...state, selectedSubscription: {} }));
  };

  const componentMapper = {
    ...mapper,
    'subscriptions-table': SubscriptionsTableComponent,
    'validate-subscription': ValidateSubscription,
  };

  useEffect(() => {
    if (pglogicalReplicationFormId) {
      // miqSparkleOn();
      http.get(`/ops/pglogical_subscriptions_form_fields/${pglogicalReplicationFormId}`).then((response) => {
        setState({
          initialValues: {},
          subscriptions: response.subscriptions,
          form: {
            type: 'replication',
            className: 'replication_form',
            action: 'add',
          },
          replicationHelperText: '',
          isLoading: false,
        });
      });
      // miqSparkleOff();
    }
  }, [pglogicalReplicationFormId]);

  const onModalSubmit = (values) => {
    if (replicationType === 'global') {
      if (form.action === 'add') {
        const newSubscription = {
          dbname: values.dbname,
          host: values.host,
          user: values.user,
          password: values.password,
          port: values.port,
        };

        setState((state) => ({
          ...state,
          subscriptions: [...state.subscriptions, newSubscription],  // Adding directly to the subscriptions array
        }));
      } else if (form.action === 'edit') {
        const editedSub = {
          dbname: values.dbname,
          host: values.host,
          password: values.password,
          port: values.port,
          user: values.user,
        };

        setState((prev) => ({
          ...prev,
          subscriptions: prev.subscriptions.map((subscription, i) =>
            (i === selectedRowId ? editedSub : subscription)),
        }));
      }
    }

    handleModalClose();
  };

  const onSubmit = (values) => {
    if (replicationType === 'global') {
      const subscriptionData = subscriptions.reduce((acc, item, index) => {
        acc[index] = item;
        return acc;
      }, {});

      const data = {};
      data.replication_type = 'global';
      data.subscriptions = subscriptionData;

      http.post(`/ops/pglogical_save_subscriptions/${pglogicalReplicationFormId}?button=${'save'}`, data, {
        skipErrors: [400],
      }).then(() => {
        handleModalClose();

        add_flash(__('Order Request was Submitted'), 'success');
      }).catch(() => {
        add_flash(__('Order Request Failed'), 'error');
      });
    } else if (replicationType === 'remote') {
      values.replication_type = 'remote';
      http.post(`/ops/pglogical_save_subscriptions/${pglogicalReplicationFormId}?button=${'save'}`, values, {
        skipErrors: [400],
      }).then(() => {
        // const message = __('Order Request was Submitted');
        // miqRedirectBack(message, 'success', '/miq_request/show_list?typ=service/');
      }).catch((err) => {
        console.log(err);
      });
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
    <div>
      <MiqFormRenderer
        schema={createSchema(initialValues, subscriptions, form, replicationHelperText, setState, setModalOpen)}
        componentMapper={componentMapper}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset
        buttonsLabels={{ submitLabel }}
        // clearOnUnmount={form.type !== 'replication'}
      />

      <Modal
        open={isModalOpen}
        modalHeading={selectedSubscription && Object.keys(selectedSubscription).length
          ? `Edit ${selectedSubscription.dbname}`
          : 'Add Subscription'}
        onRequestClose={handleModalClose}
        passiveModal
      >
        {/* Render the MiqFormRenderer inside the modal */}
        <MiqFormRenderer
          schema={createSubscriptionSchema(initialValues, subscriptions, form, replicationHelperText, setState, setModalOpen)}
          componentMapper={componentMapper}
          initialValues={selectedSubscription || {}}
          onSubmit={onModalSubmit} // This will save and close the modal
          onCancel={handleModalClose} // This will close the modal
          canReset
          buttonsLabels={{ submitLabel }}
          // clearOnUnmount
        />
      </Modal>
    </div>

  );
};

SettingsReplicationForm.propTypes = {
  pglogicalReplicationFormId: PropTypes.string,
};
SettingsReplicationForm.defaultProps = {
  pglogicalReplicationFormId: undefined,
};

export default SettingsReplicationForm;
