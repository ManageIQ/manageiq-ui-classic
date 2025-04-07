/* eslint-disable camelcase */
import { componentTypes } from '@@ddf';
import { createRows } from './helper';
import miqFlash from '../../helpers/miq-flash';

const createSchema = (subscriptions, setState, setModalOpen, replicationType, isSubscriptionModified) => {
  const deleteSubscription = (selectedRow) => {
    const rowId = parseInt(selectedRow.id, 10);

    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((_, i) => i !== rowId),
      selectedRowId: rowId,
      selectedSubscription: subscriptions[rowId],
    }));
  };

  const editSubscription = (selectedRow) => {
    const rowId = parseInt(selectedRow.id, 10);
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
  };

  const validateSubscription = (selectedRow) => {
    debugger
    const cellKeys = [0, 1, 2, 3, 4];
    const rowData = {};

    cellKeys.forEach((index) => {
      const cell = selectedRow.cells[index];
      if (cell) {
        rowData[cell.id.split(':')[1]] = cell.value;
      }
    });

    http.post(`/ops/pglogical_validate_subscription`, rowData, { skipErrors: [400] }, {
      skipErrors: [400],
    })
      .then((response) => {
        if (response.status === 'success') {
          miqFlash('success', __('Validation successful'));
        } else {
          miqFlash('error', __(response.message));
        }
      }).catch(() => {
        miqFlash('error', __('Something went wrong'));
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
              helperText = 'No replication role has been set';
            } else if (state.savedReplicationType === 'remote' && newValue === 'none') {
              helperText = 'Replication will be disabled for this region';
            } else if (state.savedReplicationType === 'global' && newValue === 'none') {
              helperText = 'All current subscriptions will be removed';
            } else if (state.savedReplicationType === 'global' && newValue === 'remote') {
              helperText = 'Changing to remote replication role will remove all current subscriptions';
            } else if (newValue === 'global' && state.subscriptions.length === 0) {
              helperText = 'At least 1 subscription must be added to save server replication type';
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
            label: `<${_('None')}>`,
            value: 'none',
          },
          {
            label: `Global`,
            value: 'global',
          },
          {
            label: `Remote`,
            value: 'remote',
          },
        ],
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
            switch (selectedRow.callbackAction) {
              case 'editSubscription':
                editSubscription(selectedRow);
                break;
              case 'deleteSubscription':
                deleteSubscription(selectedRow);
                break;
              case 'validateSubscription':
                validateSubscription(selectedRow);
                break;
              default:
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
            }));
          },
        }],
      },
    ],
  });

  return replicationFields;
};

export default createSchema;
