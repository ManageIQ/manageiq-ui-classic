// Creates the rows for the 'subscriptions-table' component
export const createRows = (subscriptions) => {
  const rows = [];

  if (Array.isArray(subscriptions) && subscriptions.length > 0) {
    subscriptions.forEach((value, index) => {
      const isMarkedForDeletion = value.remove === true;

      rows.push({
        id: index.toString(),
        disabled: isMarkedForDeletion,
        dbname: { text: value.dbname },
        host: { text: value.host },
        user: { text: value.user },
        password: { text: '*'.repeat(value.password.length) },
        port: { text: value.port },
        backlog: { text: value.backlog ? value.backlog : '' },
        status: { text: value.status ? value.status : '' },
        provider_region: { text: value.provider_region || value.provider_region === 0 ? value.provider_region : '' },
        edit: {
          is_button: true,
          text: __('Update'),
          kind: 'tertiary',
          size: 'md',
          callback: 'editSubscription',
          disabled: isMarkedForDeletion,
        },
        validate: {
          is_button: true,
          text: __('Validate'),
          kind: 'tertiary',
          size: 'md',
          callback: 'validateSubscription',
          disabled: isMarkedForDeletion,
        },
        delete: isMarkedForDeletion ? {
          is_button: true,
          text: __('Cancel Delete'),
          kind: 'tertiary',
          size: 'md',
          callback: 'cancelDelete',
        } : {
          is_button: true,
          text: __('Delete'),
          kind: 'danger',
          size: 'md',
          callback: 'deleteSubscription',
        },
      });
    });
  }
  return rows;
};
