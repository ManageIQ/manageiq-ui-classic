import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { Button, Select } from 'carbon-components-react';
import {
  componentTypes, FormSpy, useFieldApi, useFormApi,
} from '@data-driven-forms/react-form-renderer';
import MiqFormRenderer from '@@ddf';
import { Renew32 } from '@carbon/icons-react';

const DynamicSelect = (props) => {
  // const {
  //   initialValues, options, id, titleText, label, placeholder,
  //   ...rest
  // } = useFieldApi(prepareProps(props));
  const {
    customProp,
    label,
    input,
    isRequired,
    meta: { error, touched },
    FieldArrayProvider,
    dataType,
    ...rest
  } = useFieldApi(props);
  console.log(input);
  console.log(props);
  // const [defaultValues, setDefaultValues] = useState(initialValues || []);

  console.log(props.initialValue);

  const fields = {
    fields: [
      {
        component: componentTypes.SELECT,
        id: props.id,
        name: props.name,
        label: props.label,
        // options: props.options,
        options: [{ value: '0', label: 'test' }, { value: '1', label: '1' }],
        onChange: (val) => {
          input.value = val;
          props.setDynamicFieldValues({ ...props.dynamicFieldValues, [props.name]: input.value });
          // props.setDynamicFieldValues({ [props.name]: input.value });
          console.log(input.value);
        },
        resolveProps: (fieldProps, { meta, input }, formOptions) => {
          // console.log(fieldProps);
          // console.log(meta);
          // console.log(input);
          // console.log(formOptions);
          // props.setDynamicFieldValues({ ...props.dynamicFieldValues, [props.name]: input.value });
          // props.setDynamicFieldValues({ [props.name]: input.value });
        },
      },
    ],
  };

  return (
    // <div>
    //   <label style={{ color: 'initial' }} htmlFor={input.name}>
    //     {isRequired && <span>*&nbsp;</span>}
    //     {label}
    //   </label>
    //   <input id={input.name} {...input} {...rest} />
    //   {touched && error && <p>{error}</p>}
    //   {customProp && <p style={{ color: 'initial' }}>This is a custom prop and has nothing to do with form schema</p>}
    //   <select name="cars" id="cars">
    //     <option value="volvo">Volvo</option>
    //     <option value="saab">Saab</option>
    //     <option value="mercedes">Mercedes</option>
    //     <option value="audi">Audi</option>
    //   </select>
    // </div>
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
    <div id="dynamic-field">
      {formFields}
      <FormSpy>
        {() => (
          <div className="custom-button-wrapper">
            <Button
              onClick={() => console.log('Clicked')}
              renderIcon={Renew32}
              hasIconOnly
              iconDescription={__('Refresh field')}
            />
          </div>
        )}
      </FormSpy>
    </div>
  );
};

DynamicSelect.propTypes = {
};

DynamicSelect.defaultProps = {
  initialValues: [],
};

export default DynamicSelect;
