import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import { Modal } from 'carbon-components-react';
import createSchema from './settings-replication-form.schema';
import createSubscriptionSchema from './modal-form.schema';
import { SubscriptionsTableComponent } from './subscriptions-table';
import ValidateSubscription from './validate-subscription';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import mapper from '../../forms/mappers/componentMapper';
import { http } from '../../http_api';

const SettingsReplicationForm = ({ pglogicalReplicationFormId }) => {
  const [{
    initialValues, subscriptions, form, replicationHelperText, helperTextType,
    isLoading, replicationType, selectedRowId, selectedSubscription,
  }, setState] = useState(
    {
      isLoading: !!pglogicalReplicationFormId,
      helperTextType: 'warning',
      selectedSubscription: {},
      savedReplicationType: 'none',
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
          replicationHelperText: 'No replication role has been set',
          helperTextType: 'warning',
          isLoading: false,
        });
      });
      // miqSparkleOff();
    }
  }, [pglogicalReplicationFormId]);

  useEffect(() => {
    if (replicationHelperText) {
      add_flash(__(replicationHelperText), helperTextType);
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

  const handleHtmlResponseForSave = (response) => {
    const htmlContent = (response && response.replacePartials && response.replacePartials.flash_msg_div) || '';
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const txt = doc.body.textContent || '';
    const formattedText = txt.replace(/\s+/g, ' ').trim();
    setState((state) => ({
      ...state,
      replicationHelperText: formattedText,
      helperTextType: 'success',
      savedReplicationType: state.replicationType,
      subscriptions: (state.replicationType !== 'global') ? [] : state.subscriptions,
    }));
  };

  const onSubmit = (values) => {
    if (replicationType === 'global') {
      const subscriptionData = subscriptions.reduce((acc, item, index) => {
        acc[index] = item;
        return acc;
      }, {});

      const data = {};
      data.replication_type = replicationType;
      data.subscriptions = subscriptionData;

      http.post(`/ops/pglogical_save_subscriptions/${pglogicalReplicationFormId}?button=${'save'}`, data, {
        skipErrors: [400],
      }).then((response) => {
        handleModalClose();

        // response is currently received as html content
        handleHtmlResponseForSave(response);
      }).catch(() => {
        setState((state) => ({
          ...state,
          replicationHelperText: 'Something went wrong',
          helperTextType: 'error',
        }));
        // console.log(error);
      });
    // } else if (replicationType === 'remote') {
    } else {
      values.replication_type = replicationType;
      http.post(`/ops/pglogical_save_subscriptions/${pglogicalReplicationFormId}?button=${'save'}`, values, {
        skipErrors: [400],
      }).then((response) => {
        // response is currently received as html content
        handleHtmlResponseForSave(response);
      }).catch(() => {
        setState((state) => ({
          ...state,
          replicationHelperText: 'Something went wrong',
          helperTextType: 'error',
        }));
        // console.log(error);
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
        schema={createSchema(initialValues, subscriptions, form, setState, setModalOpen)}
        componentMapper={componentMapper}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset
        buttonsLabels={{
          submitLabel: __('Save'),
        }}
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
          buttonsLabels={{
            submitLabel: __('Accept'),
          }}
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
