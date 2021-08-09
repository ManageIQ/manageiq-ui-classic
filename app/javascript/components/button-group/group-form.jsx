import React, { useState, useEffect } from 'react';
import MiqFormRenderer, {useFormApi} from '@@ddf';
import { Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import groupFormSchema from './group-form-schema';
import {  FormSpy } from '@data-driven-forms/react-form-renderer';

const GroupForm = ({ rec_id, available_fields, fields, url }, ...props) => {

  const [{ isLoading, initialValues, buttonIcon, options }, setState] = useState({
    isLoading: !!rec_id,
  });

  let disableSubmit = ['invalid'];
  let iconChanged = false;
  

  /** Function to change the format of the unassiged and selected buttons from the format
   * [[string,number]] to [{label:string, value:number}] */
  const formatButton = (buttons) => {
    const options = [];
    buttons && buttons.map((btn) => options.push({ label: btn[0], value: btn[1] }));
    return options;
  };

  const buttonOptions = formatButton(available_fields.concat(fields));

  useEffect(() => {
    if (rec_id) {
      API.get(`/api/custom_button_sets/${rec_id}`).then((initialValues) => {    
        console.log(initialValues);
        setState((state) => ({ 
          ...state, 
          initialValues,
          buttonIcon: initialValues.set_data.button_icon,
          options: buttonOptions,
          isLoading: false,
         }));
      });
    } else {
      setState((state) => ({
        ...state,
        options: buttonOptions,
        isLoading: false,
       }));
    }
  }, [rec_id]);

 if (rec_id && initialValues) {
    if (initialValues.set_data.button_icon !== buttonIcon) {
        iconChanged = true;
        disableSubmit =[];
    } else {
      disableSubmit = ['pristine', 'invalid'];
      iconChanged = false;
    }
  } else {
    disableSubmit = ['invalid'];
    iconChanged = false;
  }
    
  const onSubmit = (values) => {
    console.log(values);
    values.set_data.button_color = (values.set_data && values.set_data.button_color) ? values.set_data.button_color : '#000';
    values.set_data.button_icon = buttonIcon;
    miqSparkleOn();
    const request = rec_id
      ? API.patch(`/api/custom_button_sets/${rec_id}`, values)
      : API.post('/api/custom_button_sets', values);
    request.then(() => {
      const message = sprintf(
        rec_id
          ? __('Modification of Button group "%s" has been successfully.')
          : __('Button group "%s" has been successfully added.'),
        values.name,
      );
      miqRedirectBack(message, undefined, '/miq_ae_customization/explorer');
    }).catch((e) => miqSparkleOff());
  };

  const onCancel = () => {
    const message = sprintf(
      rec_id
        ? __('Edit of Button group "%s" was canceled by the user.')
        : __('Creation of new Button group was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/miq_ae_customization/explorer');
  };

  if (isLoading|| (options === undefined)) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <div className="col-md-12">
      <MiqFormRenderer
        initialValues={initialValues}
        FormTemplate={(props) => <FormTemplate {...props} modified={ iconChanged } miqSubmit={onSubmit}/>}
        schema={groupFormSchema(initialValues, buttonIcon, options, url, setState)}
        //onSubmit={onSubmit}
        //canReset={!!rec_id}
        //onCancel={onCancel}
        //disableSubmit={disableSubmit}
      />
    </div>
  );
};

const FormTemplate = ({ formFields, groupFormSchema, modified, miqSubmit}) => {
  const { handleSubmit, onReset, onCancel, getState } = useFormApi();
  const { submitting, valid, pristine } = getState();
  return (
    <form onSubmit={miqSubmit}>
      {formFields}
      <FormSpy>
        {() => (
          <div style={{ marginTop: 8 }}>
            <button disabled={!valid && !modified} 
                    style={{ marginRight: 8 }} 
                    type="submit" 
                    
                    variant="contained">
              Submit
            </button>
            <button disabled={ pristine } 
                    style={{ marginRight: 8 }} 
                    onClick={ onReset } 
                    variant="contained">
              Reset
            </button>
            <button variant="contained" onClick={onCancel}>
              Cancel
            </button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

GroupForm.propTypes = {
  rec_id: PropTypes.number,
};

GroupForm.defaultProps = {
  rec_id: undefined,
};

export default GroupForm;