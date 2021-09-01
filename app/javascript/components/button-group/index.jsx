import React, { useState, useEffect } from 'react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import { Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './group-form.schema';

const GroupForm = ({
  recId, availableFields, fields, url, appliesToClass,
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
    if (buttons.length <= 0) {
      return [];
    }
    const options = [];
    buttons.forEach((btn) => options.push({ label: btn[0], value: btn[1] }));
    return options;
  };

  /** available_fields or an empty array is passed as props. */
  const buttonOptions = formatButton(availableFields.concat(fields));

  /** Function to extract the ButtonGroupName from api result like 'ButtonGroupName | xyz'. */
  const formatName = (buttonGroupName) => {
    if (!buttonGroupName) {
      return undefined;
    }
    return buttonGroupName.split('|')[0].trim('');
  };

  /** Function to update the field set_data's values during form submit */
  const formatSetData = (setData) => ({
    ...setData,
    button_color: (setData && setData.button_color) ? setData.button_color : '#000',
    button_icon: buttonIcon,
    applies_to_class: appliesToClass,
  });

  useEffect(() => {
    if (recId) {
      API.get(`/api/custom_button_sets/${recId}`).then((initialValues) => {
        setState((state) => ({
          ...state,
          initialValues: { ...initialValues, name: formatName(initialValues.name) },
          buttonIcon: (initialValues && initialValues.set_data) ? initialValues.set_data.button_icon : '',
          options: buttonOptions,
          isLoading: false,
        }));
      });
    } else {
      setState((state) => ({
        ...state,
        options: availableFields.length > 0 ? buttonOptions : [],
        isLoading: false,
      }));
    }
  }, []);

  iconChanged = (recId && initialValues && initialValues.set_data)
    ? (initialValues.set_data.button_icon !== buttonIcon)
    : false;

  const onSubmit = (values) => {
    miqSparkleOn();
    values.set_data = formatSetData(values.set_data);
    const request = recId
      ? API.patch(`/api/custom_button_sets/${recId}`, values)
      : API.post('/api/custom_button_sets', values);
    request.then(() => {
      const message = sprintf(
        recId
          ? __('Modification of Button group "%s" has been successfully queued.')
          : __('Add Button group "%s" has been successfully queued.'),
        values.name,
      );
      miqRedirectBack(message, 'success', '/miq_ae_customization/explorer');
    }).catch(() => miqSparkleOff());
  };

  const onCancel = () => {
    const message = sprintf(
      recId
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
        FormTemplate={(props) => <FormTemplate {...props} recId={recId} modified={iconChanged} />}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onReset={onFormReset}
      />
    </div>
  );
};

const FormTemplate = ({
  formFields, recId, modified,
}) => {
  const {
    handleSubmit, onReset, onCancel, getState,
  } = useFormApi();
  const { valid, pristine } = getState();
  const submitLabel = !!recId ? __('Save') : __('Add');
  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {() => (
          <div className="custom-button-wrapper">
            <button
              disabled={(!valid || !modified) && pristine}
              className="bx--btn bx--btn--primary btnRight"
              type="submit"
              variant="contained"
            >
              {submitLabel}
            </button>

            {!!recId
              ? (
                <button
                  disabled={(!valid || !modified) && pristine}
                  className="bx--btn bx--btn--secondary btnRight"
                  variant="contained"
                  onClick={onReset}
                  type="button"
                >
                 { __('Reset')}
                </button>
              ) : null}

            <button variant="contained" type="button" onClick={onCancel} className="bx--btn bx--btn--secondary">
            { __('Cancel')}
            </button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

GroupForm.propTypes = {
  recId: PropTypes.number,
  availableFields: PropTypes.arrayOf(PropTypes.any),
  fields: PropTypes.arrayOf(PropTypes.any),
  url: PropTypes.string,
  appliesToClass: PropTypes.string,
};

GroupForm.defaultProps = {
  recId: undefined,
  availableFields: [],
  fields: [],
  url: '',
  appliesToClass: '',
};

FormTemplate.propTypes = {
  recId: PropTypes.number,
  formFields: PropTypes.arrayOf(PropTypes.any),
  modified: PropTypes.bool,
};

FormTemplate.defaultProps = {
  recId: undefined,
  formFields: [],
  modified: false,
};

export default GroupForm;
