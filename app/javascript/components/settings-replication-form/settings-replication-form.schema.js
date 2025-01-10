/* eslint-disable camelcase */
import { componentTypes, validatorTypes } from '@@ddf';
import { createRows } from './helper';

const createSchema = (initialValues, subscriptions, form, replicationHelperText, setState, setModalOpen) => {
  const deleteSubscription = (selectedRow, cellType, formOptions) => {
    subscriptions.splice(selectedRow.id, 1);

    setState((state) => ({
      ...state,
      subscriptions,
    }));
  };

  const editSubscription = (selectedRow) => {
    setState((state) => ({
      ...state,
      initialValues: {
        ...state.initialValues,
        dbname: selectedRow.cells[0].value,
        host: selectedRow.cells[1].value,
        user: selectedRow.cells[2].value,
        password: selectedRow.cells[3].value,
        port: selectedRow.cells[4].value,
        subId: selectedRow.id,
      },
      // form: {
      //   type: 'subscription',
      //   className: 'subscription-form',
      //   action: 'edit',
      // },
    }));
    setModalOpen(true);
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

          if (initialValues.replication_type === 'none' && value === 'none') {
            helperText = __('No replication role has been set');
          } else if (initialValues.replication_type === 'remote' && value === 'none') {
            helperText = __('Replication will be disabled for this region');
          } else if (initialValues.replication_type === 'global' && value === 'none') {
            helperText = __('All current subscriptions will be removed');
          } else if (initialValues.replication_type === 'global' && value === 'remote') {
            helperText = __('Changing to remote replication role will remove all current subscriptions');
          }

          setState((state) => ({
            ...state,
            replicationHelperText: helperText,
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
            setState((state) => ({
              ...state,
              initialValues: {
                replication_type: state.initialValues.replication_type,
                subscriptions: state.initialValues.subscriptions,
              },
              // form: {
              //   type: 'subscription',
              //   className: 'subscription-form',
              //   action: 'add',
              // },
            }));
          },
        }],
      },
    ],
  });

  // const subscriptionFields = ({
  //   fields: [
  //     {
  //       component: 'validate-subscription',
  //       name: 'validate-sub',
  //       id: 'validate-sub',
  //       isRequired: true,
  //       validate: [{ type: validatorTypes.REQUIRED }],
  //       skipSubmit: true,
  //       fields: [
  //         {
  //           component: componentTypes.TEXT_FIELD,
  //           name: 'dbname',
  //           id: 'dbname',
  //           label: __('Database'),
  //           isRequired: true,
  //           validate: [{ type: validatorTypes.REQUIRED }],
  //         },
  //         {
  //           component: componentTypes.TEXT_FIELD,
  //           name: 'host',
  //           id: 'host',
  //           label: __('Host'),
  //           isRequired: true,
  //           validate: [{ type: validatorTypes.REQUIRED }],
  //         },
  //         {
  //           component: componentTypes.TEXT_FIELD,
  //           name: 'user',
  //           id: 'user',
  //           label: __('Username'),
  //           isRequired: true,
  //           validate: [{ type: validatorTypes.REQUIRED }],
  //         },
  //         {
  //           component: componentTypes.TEXT_FIELD,
  //           name: 'password',
  //           id: 'password',
  //           label: __('Password'),
  //           type: 'password',
  //           isReadOnly: form.action === 'edit',
  //           isRequired: true,
  //           validate: [{ type: validatorTypes.REQUIRED }],
  //         },
  //         {
  //           component: componentTypes.TEXT_FIELD,
  //           name: 'port',
  //           id: 'port',
  //           label: __('Port'),
  //           isRequired: true,
  //           validate: [{ type: validatorTypes.REQUIRED }],
  //         },
  //       ],
  //     },
  //   ],
  // });

  return replicationFields;
};

export default createSchema;
