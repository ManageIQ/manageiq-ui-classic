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
    initialValues, subscriptions, form, replicationHelperText, isLoading,
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
      if (form.action === 'add') {
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
      } else if (form.action === 'edit') {
        let modifiedSubscriptions = [];
        modifiedSubscriptions = modifiedSubscriptions.concat(subscriptions);

        const editedSub = {
          dbname: values.dbname,
          host: values.host,
          password: values.password,
          port: values.port,
          user: values.user,
        };

        modifiedSubscriptions[initialValues.subId] = editedSub;

        setState((state) => ({
          ...state,
          initialValues: {
            replication_type: state.initialValues.replication_type,
            subscriptions: state.initialValues.subscriptions,
          },
          subscriptions: modifiedSubscriptions,
          form: {
            type: 'replication',
            className: 'replication_form',
            action: 'edit',
          },
        }));
      }
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

  /* const onReset = () => {
    setEnforced(() => ({ ...initialValues.enforced }));
    setValues(() => ({ ...initialValues.values }));
    setDisabled(true);
    setChanged(true);
    setInvalid(() => ({ ...initialValues.invalid }));
    // eslint-disable-next-line no-return-assign
    Array.from(document.querySelectorAll('.quota-table-input')).forEach((input, index) => input.value = initialValues.values[index]);
    add_flash(__('All changes have been reset'), 'warn');
  }; */

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
        clearOnUnmount={form.type !== 'replication'}
      />

      <Modal
        open={isModalOpen}
        modalHeading={currentSubscription ? `Edit ${currentSubscription.dbname}` : 'Add Subscription'}
        onRequestClose={handleModalClose}
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
        onSecondaryButtonClick={handleModalClose}
        onRequestSubmit={() => onSubmit(currentSubscription || {})}
      >
        {/* Render the MiqFormRenderer inside the modal */}
        <MiqFormRenderer
          schema={createSubscriptionSchema(initialValues, subscriptions, form, replicationHelperText, setState, setModalOpen)}
          componentMapper={componentMapper}
          initialValues={initialValues}
          onSubmit={onSubmit} // This will save and close the modal
          onCancel={handleModalClose} // This will close the modal
          canReset
          buttonsLabels={{ submitLabel }}
          clearOnUnmount={form.type !== 'replication'}
        />
      </Modal>
    </div>

  );

  /* if (form.type === 'subscription') {
  } else {
    return !isLoading && (
      <div className="settings-replication-form">
        <div className="subscriptions-section">
          <div className="subscriptions-button" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <Button
              kind="primary"
              className="subscription-add bx--btn bx--btn--primary pull-right"
              type="button"
              variant="contained"
              onClick={() => onButtonClick(formOptions)}
            >
              {addButtonLabel}
            </Button>
          </div>
          <div className="subscriptions-table" style={{ display: 'grid', overflow: 'auto' }}>
            <MiqDataTable
              headers={[
                { key: 'dbname', header: __('Database') },
                { key: 'host', header: __('Host') },
                { key: 'user', header: __('Username') },
                { key: 'password', header: __('Password') },
                { key: 'port', header: __('Port') },
                { key: 'backlog', header: __('Backlog') },
                { key: 'status', header: __('Status') },
                { key: 'provider_region', header: __('Region') },
                { key: 'edit', header: __('Edit') },
                { key: 'delete', header: __('Delete') },
              ]}
              rows={rows}
              size="md"
              sortable={false}
              onCellClick={(selectedRow, cellType) => onCellClick(selectedRow, cellType, formOptions)}
            />
          </div>
        </div>
        <div className="bx--btn-set">
          <Button kind="primary" tabIndex={0} disabled={disabled} type="submit" onClick={onSubmit}>
            {submitLabel}
          </Button>
          <Button kind="secondary" style={{ marginLeft: '10px' }} tabIndex={0} disabled={changed} type="reset" onClick={onReset}>
            {__('Reset')}
          </Button>
          <Button kind="secondary" style={{ marginLeft: '10px' }} tabIndex={0} type="button" onClick={onCancel}>
            {__('Cancel')}
          </Button>
        </div>
      </div>
    );
  } */
};

SettingsReplicationForm.propTypes = {
  pglogicalReplicationFormId: PropTypes.string,
};
SettingsReplicationForm.defaultProps = {
  pglogicalReplicationFormId: undefined,
};

export default SettingsReplicationForm;
