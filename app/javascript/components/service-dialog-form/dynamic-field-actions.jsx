import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
import { Close16, Edit16 } from '@carbon/icons-react';
import { SD_ACTIONS } from './helper';
import EditFieldModal from './edit-field-modal';

/** Component to render a Field. */
const DynamicFieldActions = ({ componentId, dynamicFieldAction, fieldConfiguration }) => {
  const [{ showModal }, setState] = useState({ showModal: false });

  const onModalHide = () => setState((state) => ({ ...state, showModal: false }));
  const onModalShow = () => setState((state) => ({ ...state, showModal: true }));
  const onModalApply = () => setState((state) => ({ ...state, showModal: false }));

  const renderEditButton = () => (
    <Button
      renderIcon={Edit16}
      kind="ghost"
      iconDescription={__('Edit')}
      onClick={onModalShow}
      onKeyPress={(event) => dynamicFieldAction(SD_ACTIONS.field.edit, event)}
      title={__('Edit field')}
    />
  );

  const renderRemoveButton = () => (
    <Button
      renderIcon={Close16}
      kind="ghost"
      iconDescription={__('Remove')}
      onClick={(event) => dynamicFieldAction(SD_ACTIONS.field.delete, event)}
      onKeyPress={(event) => dynamicFieldAction(SD_ACTIONS.field.delete, event)}
      title={__('Remove field')}
    />
  );

  const renderEditFieldModal = () => (
    showModal && (
      <EditFieldModal
        componentId={componentId}
        fieldConfiguration={fieldConfiguration}
        showModal={showModal}
        onModalHide={onModalHide}
        onModalApply={onModalApply}
      />
    )
  );

  return (
    <div className="dynamic-form-field-actions">
      {renderEditButton()}
      {renderRemoveButton()}
      {renderEditFieldModal()}
    </div>
  );
};

DynamicFieldActions.propTypes = {
  componentId: PropTypes.number.isRequired,
  dynamicFieldAction: PropTypes.func.isRequired,
  fieldConfiguration: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default DynamicFieldActions;
