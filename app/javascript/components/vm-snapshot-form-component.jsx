import React from 'react';
import PropTypes from 'prop-types';
import { VmSnapshotForm } from '@manageiq/react-ui-components/dist/vm-snapshot-form';

const VmSnapshotFormComponent = (props) => {
  const {
    nameOptional,
    createUrl,
    cancelUrl,
    descriptionRequired,
    ...rest
  } = props;
  return (
    <VmSnapshotForm
      hideName={nameOptional}
      nameRequired
      descriptionRequired={nameOptional || descriptionRequired}
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
  descriptionRequired: PropTypes.bool,
};

VmSnapshotFormComponent.defaultProps = {
  nameOptional: false,
  descriptionRequired: false,
};

export default VmSnapshotFormComponent;
