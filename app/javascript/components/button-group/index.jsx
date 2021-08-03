import React, { useState, useEffect } from 'react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import { Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './group-form.schema';

const GroupForm = ({
  rec_id, available_fields, fields, url, applies_to_class
}) => {
  const [{
    isLoading, initialValues, buttonIcon, options,
  }, setState] = useState({
    isLoading: true,
  });

  let iconChanged = false;

  /** Function to change the format of the props available_fields & fields from the format
   * [[string,number]] to [{label:string, value:number}] to use as options in dual-list-select */
  const formatButton = (buttons) => {
    const options = [];
    buttons && buttons.map((btn) => options.push({ label: btn[0], value: btn[1] }));
    return options;
  };

  /** available_fields or an empty array is passed as props. */
  const buttonOptions = formatButton(available_fields.concat(fields));

  /** Function to extract the ButtonGroupName from api result like 'ButtonGroupName | xyz'. */
  const formatName = (buttonGroupName) => {
    if(!buttonGroupName){
      return undefined;
    }
    return buttonGroupName.split('|')[0].trim('');
  }

  /** Function to update the field set_data's values during form submit */
  const formatSetData = (set_data) => {
    return {  ...set_data, 
                button_color: (set_data && set_data.button_color) ? set_data.button_color : '#000', 
                button_icon: buttonIcon, 
                applies_to_class: applies_to_class };
  }

  useEffect(() => {
    if (rec_id) {
      API.get(`/api/custom_button_sets/${rec_id}`).then((initialValues) => {
        setState((state) => ({
          ...state,
          initialValues: {...initialValues, name: formatName(initialValues.name)},
          buttonIcon: (initialValues && initialValues.set_data) ? initialValues.set_data.button_icon : '',
          options: buttonOptions,
          isLoading: false,
        }));
      });
    } else {
      setState((state) => ({
        ...state,
        options: available_fields.length > 0 ? buttonOptions : [],
        isLoading: false,
      }));
    }
  }, []);

  iconChanged = (rec_id && initialValues && initialValues.set_data) 
                  ? (initialValues.set_data.button_icon !== buttonIcon) 
                  : false;

  const onSubmit = (values) => {
    miqSparkleOn();
    values.set_data = formatSetData(values.set_data);
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

  const onFormReset = () => {
    setState((state) => ({
      ...state,
      buttonIcon: initialValues.set_data.button_icon,
      isLoading: false,
    }));
    add_flash(__('All changes have been reset'), 'warn');
  };

  if (isLoading || (options === undefined)) return <Loading className="export-spinner" withOverlay={false} small />;
  return (!isLoading && options) && (
    <div className="col-md-12 button-group-form">
      <MiqFormRenderer
        schema={createSchema(buttonIcon, options, url, setState)}
        initialValues={initialValues}
        FormTemplate={(props) => <FormTemplate {...props} rec_id={rec_id} modified={iconChanged} />}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onReset={onFormReset}
      />
    </div>
  );
};

const FormTemplate = ({
  formFields, createSchema, rec_id, modified,
}) => {
  const {
    handleSubmit, onReset, onCancel, getState,
  } = useFormApi();
  const { valid, pristine } = getState();
  const submitLabel = !!rec_id ? __('Save') : __('Add');
  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {({ values, validating }) => (
          <div className="custom-button-wrapper">
            <button
              disabled={(!valid || !modified) && pristine}
              className="bx--btn bx--btn--primary btnRight"
              type="submit"
              variant="contained"
            >
              {submitLabel}
            </button>

            {!!rec_id
              ? (
                <button
                  disabled={(!valid || !modified) && pristine}
                  className="bx--btn bx--btn--secondary btnRight"
                  variant="contained"
                  onClick={onReset}
                  type="button"
                >
                  Reset
                </button>
              ) : null}

            <button variant="contained" type="button" onClick={onCancel} className="bx--btn bx--btn--secondary">
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