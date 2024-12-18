import React, { useState, useEffect } from 'react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import PropTypes from 'prop-types';
import { Loading, Button } from 'carbon-components-react';
import createSchema from './automate-simulation-form.schema';
import AutomationSimulation from '../AutomationSimulation';

const AutomateSimulationForm = ({
  resolve, maxNameLength, url, attrValuesPairs, maxLength,
}) => {
  const typeClassesOptions = [
    { label: `<${__('None')}>`, value: '-1' },
    ...Object.entries(resolve.target_classes).map(([key, value]) => ({ label: value, value: key })),
  ];

  const [formData, setFormData] = useState({
    isLoading: false,
    tempData: undefined,
    targetClass: '-1',
    simulationTree: { notice: 'Enter Automation Simulation options on the left and press Submit' },
  });

  useEffect(() => {
    if (formData.isLoading) {
      http.post(url, formData.tempData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((result) => {
          setFormData({
            ...formData,
            isLoading: false,
            simulationTree: result,
          });
          add_flash(__('Automation simulation has been run'), 'success');
        })
        .catch((error) => console.log('error: ', error));
    }
  }, [formData.isLoading]);

  const handleSubmit = (values) => {
    const instanceName = Array.isArray(values.instance_name) ? values.instance_name[0] : values.instance_name;
    const data = {
      instance_name: instanceName,
      object_message: values.object_message,
      object_request: values.object_request,
      target_class: values.target_class,
      readonly: values.readonly,
      target_id: values.selection_target,
      button: 'throw',
    };

    const attributes = Array.from({ length: attrValuesPairs.length }, (_, i) => i + 1).flatMap((i) => [`attribute_${i}`, `value_${i}`]);
    const attrValPairs = Object.fromEntries(
      attributes.flatMap((key) => (values[key] ? [[key, values[key]]] : []))
    );

    Object.entries(attrValPairs).forEach(([key, value]) => {
      data[key] = value;
    });

    setFormData({
      ...formData,
      isLoading: true,
      tempData: data,
    });
  };

  const onFormReset = () => {
    const buttons = document.querySelectorAll('.bx--list-box__selection');
    buttons.forEach((button) => button.click());
    document.getElementById('object_request').value = '';
    add_flash(__('All changes have been reset'), 'warning');
  };

  return (
    <div className="automate-simulation-page">
      <div className="automate-simulation-form-wrapper">
        <MiqFormRenderer
          className="automate-simulation-form"
          schema={createSchema(
            resolve, maxNameLength, url, attrValuesPairs,
            maxLength, typeClassesOptions, formData, setFormData
          )}
          onSubmit={handleSubmit}
          canReset
          onReset={onFormReset}
          FormTemplate={(props) => <FormTemplate {...props} />}
        />
      </div>
      <div className="automate-simulation-summary-wrapper">
        <div className="simulation-title-text">
          {__('Simulation')}
        </div>
        <div className="automate-simulation-summary">
          {formData.isLoading ? (
            <div className="summary-spinner">
              <Loading active small withOverlay={false} className="loading" />
            </div>
          ) : (
            <AutomationSimulation data={formData.simulationTree !== undefined ? formData.simulationTree : {}} />
          )}
        </div>
      </div>
    </div>
  );
};

const FormTemplate = ({
  formFields,
}) => {
  const {
    handleSubmit, onReset, getState,
  } = useFormApi();
  const { valid } = getState();
  const submitLabel = __('Save');
  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {() => (
          <div className="custom-button-wrapper">
            <Button
              disabled={!valid}
              kind="primary"
              className="btnRight"
              type="submit"
              variant="contained"
            >
              {submitLabel}
            </Button>
            <Button variant="contained" type="button" onClick={onReset} kind="secondary">
              { __('Reset')}
            </Button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

AutomateSimulationForm.propTypes = {
  resolve: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  maxNameLength: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  attrValuesPairs: PropTypes.arrayOf(PropTypes.number).isRequired,
  maxLength: PropTypes.number.isRequired,
};

FormTemplate.propTypes = {
  formFields: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
};

export default AutomateSimulationForm;
