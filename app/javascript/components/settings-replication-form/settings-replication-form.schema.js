/* eslint-disable camelcase */
import { componentTypes } from '@@ddf';
import { createRows } from './helper';
import miqFlash from '../../helpers/miq-flash';

const createSchema = (subscriptions, setState, setModalOpen, replicationType, isSubscriptionModified, setConfirmModal) => {
  const deleteSubscription = (selectedRow) => {
    const rowId = parseInt(selectedRow.id, 10);
    const subscription = subscriptions[rowId];

    const isNewRecord = subscription.newRecord === true;

    if (isNewRecord) {
      // New records: remove immediately from UI
      setState((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.filter((_, i) => i !== rowId),
        selectedRowId: rowId,
        selectedSubscription: subscriptions[rowId],
      }));
    } else {
      // Existing records: show confirmation dialog
      setConfirmModal({
        type: 'delete',
        rowId,
        label: __('Confirm Delete'),
        message: __(
          'Deleting a subscription will remove all replicated data which originated in the selected region. Do you want to continue?'
        ),
      });
    }
  };

  const cancelDelete = (selectedRow) => {
    const rowId = parseInt(selectedRow.id, 10);
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub, i) => {
        if (i === rowId) {
          // eslint-disable-next-line no-unused-vars
          const { remove, ...rest } = sub;
          return rest;
        }
        return sub;
      }),
    }));
  };

  const editSubscription = (selectedRow) => {
    const rowId = parseInt(selectedRow.id, 10);
    const subscription = subscriptions[rowId];
    const isNewRecord = subscription.newRecord === true;

    // Show confirmation dialog for existing subscriptions
    if (!isNewRecord) {
      setConfirmModal({
        type: 'edit',
        rowId,
        label: __('Confirm Edit'),
        message: __(
          'An updated subscription must point to the same database with which it was originally created. '
          + 'Failure to do so will result in undefined behavior. Do you want to continue?'
        ),
      });
    } else {
      // New records: open edit modal directly
      setModalOpen(true);
      setState((state) => ({
        ...state,
        selectedRowId: rowId,
        form: {
          type: 'replication',
          className: 'replication_form',
          action: 'edit',
        },
        selectedSubscription: subscriptions[rowId],
      }));
    }
  };

  const validateSubscription = (selectedRow) => {
    const rowData = {};

    selectedRow.cells.forEach((cell) => {
      if (cell && cell.id) {
        const fieldName = cell.id.split(':')[1];
        if (fieldName && cell.value !== undefined) {
          rowData[fieldName] = cell.value;
        }
      }
    });

    http.post(`/ops/pglogical_validate_subscription`, rowData, {
      skipErrors: [400],
    }).then((response) => {
      if (response.status === 'success') {
        miqFlash('success', response.message);
      } else {
        miqFlash('error', response.message);
      }
    }).catch(() => {
      miqFlash('error', __('Unable to validate subscription.'));
    });
  };

  const replicationFields = ({
    fields: [
      {
        component: componentTypes.SELECT,
        id: 'replication_type',
        name: 'replication_type',
        label: __('Type'),
        initialValue: replicationType,
        onChange: (newValue) => {
          let helperText;

          setState((state) => {
            if (state.savedReplicationType === 'none' && newValue === 'none') {
              helperText = __('No replication role has been set');
            } else if (state.savedReplicationType === 'remote' && newValue === 'none') {
              helperText = __('Replication will be disabled for this region');
            } else if (state.savedReplicationType === 'global' && newValue === 'none') {
              helperText = __('All current subscriptions will be removed');
            } else if (state.savedReplicationType === 'global' && newValue === 'remote') {
              helperText = __('Changing to remote replication role will remove all current subscriptions');
            } else if (newValue === 'global' && state.subscriptions.length === 0) {
              helperText = __('At least 1 subscription must be added to save server replication type');
            }

            return {
              ...state,
              replicationHelperText: helperText,
              helperTextType: 'warning',
              replicationType: newValue,
            };
          });
        },
        options: [
          {
            label: `<${__('None')}>`,
            value: 'none',
          },
          {
            label: __('Global'),
            value: 'global',
          },
          {
            label: __('Remote'),
            value: 'remote',
          },
        ],
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'subscriptions_changed',
        label: __('Subscriptions Changed'),
        hideField: true,
      },
      {
        component: componentTypes.SUB_FORM,
        name: 'subscriptions_section',
        id: 'subscriptions_section',
        key: isSubscriptionModified,
        condition: {
          when: 'replication_type',
          is: 'global',
        },
        fields: [{
          component: 'subscriptions-table',
          name: 'subscriptions-table',
          id: 'subscriptions-table',
          rows: createRows(subscriptions),
          onCellClick: (selectedRow) => {
            // eslint-disable-next-line default-case
            switch (selectedRow.callbackAction) {
              case 'editSubscription':
                editSubscription(selectedRow);
                break;
              case 'deleteSubscription':
                deleteSubscription(selectedRow);
                break;
              case 'cancelDelete':
                cancelDelete(selectedRow);
                break;
              case 'validateSubscription':
                validateSubscription(selectedRow);
                break;
            }
          },
          addButtonLabel: __('Add Subscription'),
          onButtonClick: () => {
            setModalOpen(true);
            setState((state) => ({
              ...state,
              form: {
                type: 'replication',
                className: 'replication_form',
                action: 'add',
              },
              selectedSubscription: {},
            }));
          },
        }],
      },
    ],
  });

  return replicationFields;
};

export default createSchema;
