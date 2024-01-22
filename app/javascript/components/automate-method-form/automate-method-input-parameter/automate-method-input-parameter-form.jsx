import React, { useState, useEffect, useContext } from 'react';
import MiqFormRenderer from '@@ddf';
import { Modal } from 'carbon-components-react';
import PropTypes from 'prop-types';
import { inputParameterSchema } from './schema';
import { InputParameterRecordActions } from './helper';
import AutomateMethodContext from '../automate-method-context';

const AutomateMethodInputParameterForm = ({ modalStatus }) => {
  /** Context to access data from parent component */
  const { formData, updateInputParameter } = useContext(AutomateMethodContext);

  const [data, setData] = useState({
    initialValues: undefined,
  });

  /** Effect hook to update initial values when selectedId changes */
  useEffect(() => {
    const { selectedId, items } = formData.inputParameter;
    if (selectedId) {
      setData({
        ...data,
        initialValues: items[selectedId],
      });
    }
  }, [formData.inputParameter.selectedId]);

  const addOrUpdateInputParameter = (values) => (formData.inputParameter.selectedId
    ? updateInputParameter(InputParameterRecordActions.UPDATE, { values })
    : updateInputParameter(InputParameterRecordActions.ADD, { values }));

  return (
    <Modal
      open={modalStatus}
      modalHeading={__('Add Input Parameters')}
      secondaryButtonText={__('Cancel')}
      onRequestClose={() => updateInputParameter(InputParameterRecordActions.CLOSE, undefined)}
      passiveModal
    >
      <MiqFormRenderer
        schema={inputParameterSchema(formData.apiResponse)}
        initialValues={data.initialValues}
        onSubmit={(values) => addOrUpdateInputParameter(values)}
      />
    </Modal>
  );
};

export default AutomateMethodInputParameterForm;

AutomateMethodInputParameterForm.propTypes = {
  modalStatus: PropTypes.bool.isRequired,
};
