import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import { Modal } from 'carbon-components-react';
import createSchema from './settings-replication-form.schema';
import createSubscriptionSchema from './modal-form.schema';
import { SubscriptionsTableComponent } from './subscriptions-table';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import mapper from '../../forms/mappers/componentMapper';
import { http } from '../../http_api';
import miqFlash from '../../helpers/miq-flash';
import miqFlashClear from '../../helpers/miq-flash-clear';

const SettingsReplicationForm = ({ pglogicalReplicationFormId }) => {
  const [{
    subscriptions, form, replicationHelperText, helperTextType,
    isLoading, replicationType, selectedRowId, selectedSubscription, isSubscriptionModified,
  }, setState] = useState(
    {
      subscriptions: [],
      helperTextType: 'warning',
      isLoading: !!pglogicalReplicationFormId,
      selectedSubscription: {},
      savedReplicationType: 'none',
      isSubscriptionModified: false,
    }
  );

  const [isModalOpen, setModalOpen] = useState(false);

  const handleModalClose = () => {
    setModalOpen(false);
    setState((state) => ({ ...state, selectedSubscription: {} }));
  };

  const componentMapper = {
    ...mapper,
    'subscriptions-table': SubscriptionsTableComponent,
  };

  useEffect(() => {
    if (pglogicalReplicationFormId) {
      http.get(`/ops/pglogical_subscriptions_form_fields/${pglogicalReplicationFormId}`).then((response) => {
        setState({
          subscriptions: response.subscriptions,
          form: {
            type: 'replication',
            className: 'replication_form',
            action: 'add',
          },
          replicationHelperText: 'No replication role has been set',
          helperTextType: 'warning',
          isLoading: false,
        });
      });
    }
  }, [pglogicalReplicationFormId]);

  useEffect(() => {
    setState((state) => ({ ...state, isSubscriptionModified: !isSubscriptionModified }));
    if (replicationType === 'global') {
      if (subscriptions.length === 0) {
        miqFlash('warning', __('At least 1 subscription must be added to save server replication type'));
      } else {
        miqFlashClear();
      }
    }
  }, [subscriptions]);

  useEffect(() => {
    if (replicationHelperText) {
      miqFlash(helperTextType, __(replicationHelperText));
    }
  }, [replicationHelperText]);

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
          subscriptions: [...state.subscriptions, newSubscription],
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

  const handleSaveResponse = (message) => {
    setState((state) => ({
      ...state,
      replicationHelperText: message,
      helperTextType: 'success',
      savedReplicationType: state.replicationType,
      subscriptions: (state.replicationType !== 'global') ? [] : state.subscriptions,
    }));
  };

  const onSave = (values) => {
    let data;
    if (replicationType === 'global') {
      if (subscriptions.length === 0) {
        miqFlash('error', __('At least 1 subscription must be added to save server replication type'));
        return;
      }
      const subscriptionData = subscriptions.reduce((acc, item, index) => {
        acc[index] = item;
        return acc;
      }, {});
      data = { replication_type: replicationType, subscriptions: subscriptionData };
    } else {
      data = { ...values, replication_type: replicationType };
    }
    http.post(`/ops/pglogical_save_subscriptions/${pglogicalReplicationFormId}?button=save`, data, {
      skipErrors: [400],
    })
      .then((response) => {
        if (replicationType === 'global') {
          handleModalClose();
        }
        handleSaveResponse(response.message);
      })
      .catch(() => {
        miqFlash('error', __('Something went wrong'));
      });
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
        schema={createSchema(subscriptions, setState, setModalOpen, replicationType, isSubscriptionModified)}
        componentMapper={componentMapper}
        onSubmit={onSave}
        onCancel={onCancel}
        canReset
        buttonsLabels={{
          submitLabel: __('Save'),
        }}
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
          schema={createSubscriptionSchema()}
          componentMapper={componentMapper}
          initialValues={selectedSubscription || {}}
          onSubmit={onModalSubmit}
          onCancel={handleModalClose}
          canReset
          buttonsLabels={{
            submitLabel: __('Accept'),
          }}
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
