import React, { useState, useEffect } from 'react';
import MiqFormRenderer, {useFormApi} from '@@ddf';
import { Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './group-form.schema';
import {  FormSpy } from '@data-driven-forms/react-form-renderer';

const GroupForm = ({ rec_id, available_fields, fields, url }) => {

  const [{ isLoading, initialValues, buttonIcon, unassignedButtons }, setState] = useState({
    isLoading: !!rec_id
  });

  let iconChanged = false;
  
  /** Function to change the format of the unassiged and selected buttons from the format
   * [[string,number]] to [{label:string, value:number}] */
  const formatButton = (buttons) => {
    const options = [];
    buttons && buttons.map((btn) => options.push({ label: btn[0], value: btn[1] }));
    return options;
  };

  /** available_fields or an empty array is passed as props. */
  const buttonOptions = formatButton(available_fields.concat(fields));

  useEffect(() => {
    if (rec_id) {
      API.get(`/api/custom_button_sets/${rec_id}`).then((initialValues) => {
        setState((state) => ({
          ...state,
          initialValues,
          buttonIcon: initialValues.set_data.button_icon,
          unassignedButtons: buttonOptions,
          isLoading: false,
        }));
      });
    } else {
      setState((state) => ({
        ...state,
        unassignedButtons: available_fields.length > 0 ? buttonOptions : [],
        isLoading: false,
      }));
    }
  }, []);

  iconChanged = rec_id && initialValues ? (initialValues.set_data.button_icon !== buttonIcon) : false;

  const onSubmit = (values) => {
    values.set_data.button_color = (values.set_data && values.set_data.button_color) 
      ? values.set_data.button_color 
      : '#000';
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

  if (isLoading || (unassignedButtons===undefined)) return <Loading className="export-spinner" withOverlay={false} small />;
  return (!isLoading && unassignedButtons) && (
    <div className="col-md-12 button-group-form">
      <MiqFormRenderer
        schema={createSchema( buttonIcon, unassignedButtons, url, setState)}
        initialValues={initialValues}
        FormTemplate={(props) => <FormTemplate {...props} rec_id={rec_id} modified={iconChanged} />}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
      </div>
    );
  };
  
  const FormTemplate = ({ formFields, createSchema, rec_id, modified}) => {
    const { handleSubmit, onReset, onCancel, getState } = useFormApi();
    const { valid, pristine } = getState();
    const submitLabel = !!rec_id ? __('Save') : __('Add');
    console.log(valid, modified, pristine);
    return (
      <form onSubmit={handleSubmit}>
        {formFields}
        <FormSpy>
          {({values, validating }) => (
            <div className='custom-button-wrapper'>
              <button disabled={(!valid || !modified) && pristine} 
                      className={'bx--btn bx--btn--primary btnRight'}
                      type="submit" variant="contained">
                {submitLabel}
              </button>
              {
                !!rec_id && 
                  <button disabled={(!valid || !modified) && pristine} 
                          className={'bx--btn bx--btn--secondary btnRight'}
                          onClick={onReset} variant="contained">
                    Reset
                  </button>
              }
              <button variant="contained" onClick={onCancel} className={'bx--btn bx--btn--secondary'}>
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
