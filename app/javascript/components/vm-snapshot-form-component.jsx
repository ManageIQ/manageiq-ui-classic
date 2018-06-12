import React from 'react';
import PropTypes from 'prop-types';
import { VmSnapshotForm } from '@manageiq/react-ui-components/dist/vm-snapshot-form';

const VmSnapshotFormComponent = (props) => {
  const {
    nameOptional,
    createUrl,
    cancelUrl,
    ...rest
  } = props;
  const errorMessages = {
    name: __('Required'),
    description: __('Required'),
  };
  const labels = {
    name: __('Name'),
    description: __('Description'),
    snapMemory: __('Snapshot VM memory'),
    create: __('Create'),
    cancel: __('Cancel'),
  };
  return (
    <VmSnapshotForm
      errorMessages={errorMessages}
      labels={labels}
      hideName={nameOptional}
      nameRequired
      descriptionRequired={nameOptional}
      onSubmit={values => window.miqAjaxButton(createUrl, values)}
      onCancel={() => window.miqAjaxButton(cancelUrl)}
      {...rest}
    />
  );
};

VmSnapshotFormComponent.propTypes = {
  nameOptional: PropTypes.bool,
  createUrl: PropTypes.string.isRequired,
  cancelUrl: PropTypes.string.isRequired,
};

VmSnapshotFormComponent.defaultProps = {
  nameOptional: false,
};

export default VmSnapshotFormComponent;
