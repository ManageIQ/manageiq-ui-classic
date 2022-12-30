import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { Button, Select } from 'carbon-components-react';
import { componentTypes, FormSpy } from '@data-driven-forms/react-form-renderer';
import MiqFormRenderer, { useFormApi } from '@@ddf';

const DynamicSelect = (props) => {
  // const {
  //   initialValues, options, id, titleText, label, placeholder,
  //   ...rest
  // } = useFieldApi(prepareProps(props));

  console.log(props);
  // const [defaultValues, setDefaultValues] = useState(initialValues || []);
  const fields = {
    fields: [
      {
        component: componentTypes.SELECT,
        id: props.id,
        name: props.name,
        label: props.label,
        options: props.options,
      },
    ],
  };

  return (
    <MiqFormRenderer
      // initialValues={initialValues}
      FormTemplate={(props) => <FormTemplate {...props} fields={fields} />}
      schema={fields}
    />
  );
};
const verifyIsDisabled = (valid) => {
  let isDisabled = true;
  if (valid) {
    isDisabled = false;
  }
  return isDisabled;
};

const FormTemplate = ({ formFields }) => {
  const {
    handleSubmit, onCancel, getState,
  } = useFormApi();
  const { valid } = getState();
  return (
    <form id="order-service-form" onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {() => (
          <div className="custom-button-wrapper">
            {/* <Button
              disabled={verifyIsDisabled(valid)}
              kind="primary"
              className="btnRight"
              type="submit"
              id="submit"
              variant="contained"
            >
              {__('Submit')}
            </Button> */}
          </div>
        )}
      </FormSpy>
    </form>
  );
};

DynamicSelect.propTypes = {
};

DynamicSelect.defaultProps = {
  initialValues: [],
};

export default DynamicSelect;
