import React, { useState, useEffect } from 'react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import { Button, Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import createSchema from './group-form.schema';
import {
  formatButton, formatName, formatSetData, getGenericObjectButtonList,
} from './helper';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';

const GroupForm = ({
  recId, availableFields, fields, url, appliesToClass, appliesToId, isGenericObject,
}) => {
  const [{
    isLoading, initialValues, buttonIcon, options,
  }, setState] = useState({
    isLoading: true,
  });

  let iconChanged = false;
  const actionType = (recId ? 'group_update' : 'group_create');
  const buttonType = (recId ? 'save' : 'add');
  const cancelUrl = `${actionType}/${recId}?button=cancel`;
  const buttonOptions = formatButton(availableFields.concat(fields));

  const getInitialValues = (buttons = []) => {
    API.get(`/api/custom_button_sets/${recId}`)
      .then((initialValues) => {
        setState((state) => ({
          ...state,
          initialValues: { ...initialValues, name: formatName(initialValues.name) },
          buttonIcon: (initialValues && initialValues.set_data) ? initialValues.set_data.button_icon : '',
          options: isGenericObject ? buttons : buttonOptions,
          isLoading: false,
        }));
      });
  };

  useEffect(() => {
    if (isGenericObject) {
      API.get(`/api/custom_buttons?expand=resources&filter[]=applies_to_class=GenericObjectDefinition&filter[]=applies_to_id=${appliesToId}`)
        .then((data) => {
          API.get(`/api/custom_button_sets?expand=resources&filter[]=owner_type=GenericObjectDefinition&filter[]=owner_id=${appliesToId}`)
            .then((buttonGroups) => {
              const buttons = getGenericObjectButtonList(buttonGroups, data, recId);
              if (recId) {
                getInitialValues(buttons);
              } else {
                setState((state) => ({
                  ...state,
                  options: buttons,
                  isLoading: false,
                }));
              }
            });
        });
    } else if (recId) {
      getInitialValues();
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

  /** When the api resquest is completed, an miqAjaxButton method is used to retain the current page.
   * While saving from 'services/catalogItem', if the redirect method is used, the current page will not be displayed.
  */
  const onSubmit = (values) => {
    miqSparkleOn();
    if (appliesToId) {
      values.owner_id = appliesToId;
    }
    values.owner_type = appliesToClass;
    values.set_data = formatSetData(values.set_data, buttonIcon, appliesToClass, appliesToId);
    if (values.set_data.display === undefined) {
      values.set_data.display = false;
    }

    const request = recId
      ? API.patch(`/api/custom_button_sets/${recId}`, values, { skipErrors: [400, 500] })
      : API.post('/api/custom_button_sets', values, { skipErrors: [400, 500] });
    request.then(({ results }) => {
      const saveMsg = recId ? sprintf(__(`Custom Button Group "%s" has been successfully saved.`), values.name)
        : sprintf(__(`Custom Button Group "%s" has been successfully added.`), values.name);
      if (isGenericObject) {
        miqRedirectBack(saveMsg, 'success', url);
        miqSparkleOff();
      } else {
        miqAjaxButton(`${actionType}/${recId || results[0].id}?button=${buttonType}`, values);
      }
    }).catch(({ data: { error: { message } } }) => {
      const errorMessage = message ? message.split(': ')[1] : __('Please try again');
      add_flash(errorMessage, 'error');
      miqSparkleOff();
    });
  };

  const onCancel = () => {
    if (isGenericObject) {
      if (recId) {
        miqRedirectBack(sprintf(__(`Edit of Custom Button Group "%s" was canceled by the user.`), initialValues.name), 'warn', url);
      } else {
        miqRedirectBack(__(`Creation of new Custom Button Group was canceled by the user.`), 'warn', url);
      }
    } else {
      miqAjaxButton(cancelUrl);
    }
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
    <div className="col-md-12 button-form">
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
            <Button
              disabled={(!valid || !modified) && pristine}
              kind="primary"
              className="btnRight"
              type="submit"
              variant="contained"
            >
              {submitLabel}
            </Button>

            {!!recId
              ? (
                <Button
                  disabled={(!valid || !modified) && pristine}
                  kind="secondary"
                  className="btnRight"
                  variant="contained"
                  onClick={onReset}
                  type="button"
                >
                  { __('Reset')}
                </Button>
              ) : null}

            <Button variant="contained" type="button" onClick={onCancel} kind="secondary">
              { __('Cancel')}
            </Button>
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
  appliesToId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isGenericObject: PropTypes.bool,
};

GroupForm.defaultProps = {
  recId: undefined,
  availableFields: [],
  fields: [],
  url: '',
  appliesToClass: '',
  appliesToId: undefined,
  isGenericObject: false,
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
