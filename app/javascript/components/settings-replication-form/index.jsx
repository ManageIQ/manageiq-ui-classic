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
    initialValues, subscriptions, form, replicationHelperText, isLoading, replicationType, selectedRowId,
  }, setState] = useState({ isLoading: !!pglogicalReplicationFormId });
  const submitLabel = __('Save');

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState(null);

  const handleModalOpen = (action, subscription = null) => {
    setModalAction(action);
    setCurrentSubscription(subscription);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setCurrentSubscription(null);
  };

  const componentMapper = {
    ...mapper,
    'subscriptions-table': SubscriptionsTableComponent,
    'validate-subscription': ValidateSubscription,
  };

  // console.log(initialValues, form);
  // console.log("Repl type- ", replicationType);

  useEffect(() => {
    console.log("selectedRowId updated:", selectedRowId);
  }, [selectedRowId]);

  useEffect(() => {
    if (pglogicalReplicationFormId) {
      miqSparkleOn();
      debugger
      http.get(`/ops/pglogical_subscriptions_form_fields/${pglogicalReplicationFormId}`).then((response) => {
        setState({
          initialValues: {
            // replication_type: response.replication_type,
            // subscriptions: response.subscriptions,
          },
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
      miqSparkleOff();
    }
  }, [pglogicalReplicationFormId]);

  const onModalSubmit = (values) => {
    debugger
    if (replicationType === 'global') {
      if (form.action === 'add') {
        const newSubscriptions = [];

        newSubscriptions.push({
          dbname: values.dbname,
          host: values.host,
          user: values.user,
          password: values.password,
          port: values.port,
        });

        const subscriptionData = newSubscriptions.reduce((acc, item, index) => {
          acc[index] = item;
          return acc;
        }, {});

        // setState((state) => ({
        //   ...state,
        //   subscriptions: subscriptions.concat(newSubscriptions), // adds to existing subscriptions
        // }));

        // setState((state) => ({
        //   ...state,
        //   subscriptions: subscriptionData, // adds to existing subscriptions
        // }));

        debugger

        // setState((state) => ({
        //   ...state,
        //   subscriptions: {
        //     ...state.subscriptions,
        //     subscriptionData,
        //   },
        // }));

        setState((state) => {
          const nextIndex = Object.keys(state.subscriptions || {}).length; // Get next available index
        
          return {
            ...state,
            subscriptions: {
              ...state.subscriptions,  // Keep existing subscriptions
              [nextIndex]: { ...values },  // Store new entry at next index
            },
          };
        });
      }
      else if (form.action === 'edit') {
        debugger
        // let modifiedSubscriptions = [];
        // modifiedSubscriptions = modifiedSubscriptions.concat(subscriptions);


        const editedSub = {
          dbname: values.dbname,
          host: values.host,
          password: values.password,
          port: values.port,
          user: values.user,
        };

        // modifiedSubscriptions[selectedRowId] = editedSub;
        subscriptions[selectedRowId] = editedSub;

        setState((state) => ({
          ...state,
          // subscriptions: subscriptions.concat(modifiedSubscriptions),
          subscriptions,
        }));
      }
    }

    setModalOpen(false);
  };

  const onSubmit = (values) => {
    // let submitData = {};

    if (replicationType === 'global') {
      // const subscriptionData = subscriptions.reduce((acc, item, index) => {
      //   acc[index] = item;
      //   return acc;
      // }, {});

      const data = {};
      data.replication_type = 'global';
      // data.subscriptions = subscriptionData;
      data.subscriptions = subscriptions;

      http.post(`/ops/pglogical_save_subscriptions/${pglogicalReplicationFormId}?button=${'save'}`, data, {
        skipErrors: [400],
      }).then((response) => {
        setModalOpen(false);

        add_flash(__('Order Request was Submitted'), 'success');
      }).catch((response) => {
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

  debugger

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
        modalHeading={currentSubscription ? `Edit ${currentSubscription.dbname}` : 'Add Subscription'}
        onRequestClose={handleModalClose}
        passiveModal
      >
        {/* Render the MiqFormRenderer inside the modal */}
        <MiqFormRenderer
          schema={createSubscriptionSchema(initialValues, subscriptions, form, replicationHelperText, setState, setModalOpen)}
          componentMapper={componentMapper}
          initialValues={initialValues}
          onSubmit={onModalSubmit} // This will save and close the modal
          onCancel={handleModalClose} // This will close the modal
          canReset
          buttonsLabels={{ submitLabel }}
          // clearOnUnmount={form.type !== 'replication'}
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
