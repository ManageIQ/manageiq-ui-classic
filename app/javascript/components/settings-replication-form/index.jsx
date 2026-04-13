import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import { Modal } from '@carbon/react';
import createSchema from './settings-replication-form.schema';
import createSubscriptionSchema from './modal-form.schema';
import { SubscriptionsTableComponent } from './subscriptions-table';
import MiqConfirmActionModal, { modalCallbackTypes } from '../miq-confirm-action-modal';
import mapper from '../../forms/mappers/componentMapper';
import { http } from '../../http_api';
import miqFlash from '../../helpers/miq-flash';
import miqFlashClear from '../../helpers/miq-flash-clear';

const SettingsReplicationForm = ({ pglogicalReplicationFormId }) => {
  const [{
    subscriptions, form, replicationHelperText, helperTextType,
    isLoading, replicationType, selectedRowId, selectedSubscription, isSubscriptionModified,
    // eslint-disable-next-line no-unused-vars
    savedSubscriptions, savedReplicationType,
  }, setState] = useState(
    {
      subscriptions: [],
      helperTextType: 'warning',
      isLoading: !!pglogicalReplicationFormId,
      selectedSubscription: {},
      savedReplicationType: 'none',
      isSubscriptionModified: false,
      savedSubscriptions: [],
    }
  );

  const [isModalOpen, setModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const modalRef = useRef(null);
  const formApiRef = useRef(null);

  const handleModalClose = () => {
    setModalOpen(false);
    setState((state) => ({ ...state, selectedSubscription: {} }));
  };

  const handleConfirmCallback = (type) => {
    if (type === modalCallbackTypes.OK && confirmModal) {
      if (confirmModal.type === 'delete') {
        // Mark for deletion (keep in UI but flag as removed)
        setState((prev) => ({
          ...prev,
          subscriptions: prev.subscriptions.map((sub, i) => (i === confirmModal.rowId ? { ...sub, remove: true } : sub)),
          selectedRowId: confirmModal.rowId,
          selectedSubscription: { ...subscriptions[confirmModal.rowId], remove: true },
        }));
      } else if (confirmModal.type === 'edit') {
        // Open edit modal
        setModalOpen(true);
        setState((state) => ({
          ...state,
          selectedRowId: confirmModal.rowId,
          form: {
            type: 'replication',
            className: 'replication_form',
            action: 'edit',
          },
          selectedSubscription: subscriptions[confirmModal.rowId],
        }));
      }
    }
    setConfirmModal(null);
  };

  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      // Prevent close button from getting focus and showing tooltip
      const firstInput = modalRef.current.querySelector('input, textarea, select');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }, [isModalOpen]);

  const componentMapper = {
    ...mapper,
    'subscriptions-table': SubscriptionsTableComponent,
  };

  useEffect(() => {
    if (pglogicalReplicationFormId) {
      http.get(`/ops/pglogical_subscriptions_form_fields/${pglogicalReplicationFormId}`).then((response) => {
        const helperText = response.replication_type === 'none' ? __('No replication role has been set') : null;
        setState({
          subscriptions: response.subscriptions,
          savedSubscriptions: response.subscriptions,
          replicationType: response.replication_type,
          savedReplicationType: response.replication_type,
          form: {
            type: 'replication',
            className: 'replication_form',
            action: 'add',
          },
          replicationHelperText: helperText,
          helperTextType: 'warning',
          isLoading: false,
        });
      });
    }
  }, [pglogicalReplicationFormId]);

  useEffect(() => {
    // When subscriptions change, mark the form as dirty by changing a dummy field
    if (formApiRef.current) {
      formApiRef.current.change('subscriptions_changed', JSON.stringify(subscriptions));
    }
  }, [subscriptions]);

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
          newRecord: true,
        };

        setState((state) => ({
          ...state,
          subscriptions: [...state.subscriptions, newSubscription],
        }));
      } else if (form.action === 'edit') {
        const currentSubscription = subscriptions[selectedRowId];
        const editedSub = {
          ...currentSubscription,
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
    const updatedSubscriptions = subscriptions
      .filter((sub) => !sub.remove)
      .map((sub) => {
        // Remove newRecord flag using destructuring
        // eslint-disable-next-line no-unused-vars
        const { newRecord, ...subscriptionWithoutNewRecordFlag } = sub;
        return subscriptionWithoutNewRecordFlag;
      });

    setState((state) => ({
      ...state,
      replicationHelperText: message,
      helperTextType: 'success',
      savedReplicationType: state.replicationType,
      subscriptions: (state.replicationType !== 'global') ? [] : updatedSubscriptions,
      savedSubscriptions: (state.replicationType !== 'global') ? [] : updatedSubscriptions,
    }));
  };

  const onSave = (values) => {
    let data;
    if (replicationType === 'global') {
      const activeSubscriptions = subscriptions.filter((sub) => !sub.remove);
      if (activeSubscriptions.length === 0) {
        miqFlash('error', __('At least 1 subscription must be added to save server replication type'));
        return;
      }
      // Send all subscriptions including those marked for deletion
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
        miqFlash('error', __('Unable to save replication settings.'));
      });
  };

  const onReset = () => {
    setState((state) => ({
      ...state,
      subscriptions: state.savedSubscriptions,
      replicationType: state.savedReplicationType,
    }));
    miqFlash('warning', __('All changes have been reset'));
  };

  return !isLoading && (
    <div>
      <MiqFormRenderer
        schema={createSchema(subscriptions, setState, setModalOpen, replicationType, isSubscriptionModified, setConfirmModal)}
        componentMapper={componentMapper}
        initialValues={{
          replication_type: savedReplicationType,
          subscriptions_changed: JSON.stringify(savedSubscriptions),
        }}
        initialize={(formOptions) => {
          formApiRef.current = formOptions;
        }}
        onSubmit={onSave}
        onReset={onReset}
        canReset
        buttonsLabels={{
          submitLabel: __('Save'),
        }}
      />

      <Modal
        ref={modalRef}
        open={isModalOpen}
        modalHeading={selectedSubscription && Object.keys(selectedSubscription).length
          ? `Edit ${selectedSubscription.dbname}`
          : 'Add Subscription'}
        onRequestClose={handleModalClose}
        passiveModal
      >
        {/* Render the MiqFormRenderer inside the modal */}
        <MiqFormRenderer
          key={isModalOpen}
          schema={createSubscriptionSchema()}
          componentMapper={componentMapper}
          initialValues={selectedSubscription || {}}
          onSubmit={onModalSubmit}
          onCancel={handleModalClose}
          canReset
          buttonsLabels={{
            submitLabel: selectedSubscription && Object.keys(selectedSubscription).length
              ? __('Update')
              : __('Add'),
          }}
        />
      </Modal>

      {confirmModal && (
        <MiqConfirmActionModal
          modalData={{
            label: confirmModal.label,
            confirm: confirmModal.message,
            callback: handleConfirmCallback,
          }}
        />
      )}
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
