import React from 'react';
import { SnapshotForm } from '@manageiq/react-ui-components/dist/vm-snapshot-form';

ManageIQ.component.newRegistry.define('SnapshotForm', ManageIQ.component.reactBlueprint(props => (
  <SnapshotForm {...props} />
)));

const mountVmSnapshotForm = (createUrl, cancelUrl, errorMessages, labels, vendor) => {
  ManageIQ.component.newInstance(
    'SnapshotForm',
    {
      onSubmit: (values) => {
        if (values.snap_memory) {
          values.snap_memory = 1;
        }
        window.miqAjaxButton(createUrl, values);
      },
      onCancel: () => {
        window.miqAjaxButton(cancelUrl);
      },
      hideName: vendor === 'redhat',
      nameRequired: vendor === 'redhat',
      descriptionRequired: vendor === 'redhat',
      errorMessages,
      labels,
    },
    $('#snap-form').get(0),
  );
};

$(() => {
  const data = $('#snap-form').data();
  const errorMessages = { name: __('Required') };
  const labels = {
    name: __('Name'),
    description: __('Description'),
    snapMemory: __('Snapshot VM memory'),
    create: __('Create'),
    cancel: __('Cancel'),
  };
  console.log('form data: ', data);
  mountVmSnapshotForm(data['create-url'], data['cancel-url'], errorMessages, labels, data.vendor);
});
