/* eslint-disable camelcase */
import { componentTypes, validatorTypes } from '@@ddf';
import { createRows } from './helper';

const createSchema = (initialValues, subscriptions, form, replicationHelperText, setState, setModalOpen) => {

  const deleteSubscription = (selectedRow) => {
    const rowId = parseInt(selectedRow.id, 10);

    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((_, i) => i !== rowId),
      selectedRowId:rowId,
      selectedSubscription: subscriptions[rowId],
    }));
  };

  const editSubscription = (selectedRow) => {
    const rowId = parseInt(selectedRow.id, 10);
    setModalOpen(true);
    setState((state) => {
      return {
        ...state,
        selectedRowId: rowId,
        form: {
          type: 'replication',
          className: 'replication_form',
          action: 'edit',
        },
        selectedSubscription: subscriptions[rowId],
      };
    });
  };

  const replicationFields = ({
    fields: [
      {
        component: componentTypes.SELECT,
        id: 'replication_type',
        name: 'replication_type',
        label: __('Type'),
        helperText: replicationHelperText,
        onChange: (value) => {
          let helperText;

          // if (initialValues.replication_type === 'none' && value === 'none') {
          //   helperText = __('No replication role has been set');
          // } else if (initialValues.replication_type === 'remote' && value === 'none') {
          //   helperText = __('Replication will be disabled for this region');
          // } else if (initialValues.replication_type === 'global' && value === 'none') {
          //   helperText = __('All current subscriptions will be removed');
          // } else if (initialValues.replication_type === 'global' && value === 'remote') {
          //   helperText = __('Changing to remote replication role will remove all current subscriptions');
          // }

          if (value === 'none') {
            helperText = __('No replication role has been set');
          } else if (value === 'global') {
            helperText = __('At least 1 subscription must be added to save server replication type');
          } else if (initialValues.replication_type === 'global' && value === 'remote') {
            helperText = __('Changing to remote replication role will remove all current subscriptions');
          }

          setState((state) => ({
            ...state,
            replicationHelperText: helperText,
            replicationType: value,
          }));
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
        condition: {
          when: 'replication_type',
          is: 'global',
        },
        fields: [{
          component: 'subscriptions-table',
          name: 'subscriptions-table',
          id: 'subscriptions-table',
          rows: createRows(subscriptions),
          onCellClick: (selectedRow, cellType, formOptions) => {
            switch (selectedRow.callbackAction) {
              case 'editSubscription':
                editSubscription(selectedRow);
                break;
              case 'deleteSubscription':
                deleteSubscription(selectedRow, cellType, formOptions);
                break;
              default:
                break;
            }
          },
          addButtonLabel: __('Add Subscription'),
          onButtonClick: (formOptions) => {
            setModalOpen(true);
            setState((state) => {
              return {
                ...state,
                form: {
                  type: 'replication',
                  className: 'replication_form',
                  action: 'add',
                },
              };
            });
          },
        }],
      },
    ],
  });

  return replicationFields;
};

export default createSchema;
