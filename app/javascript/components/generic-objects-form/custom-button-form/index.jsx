import React, { useState, useEffect } from 'react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import { Button, Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import createSchema from './custom-button-form.schema';
import {
  getRoles, getServiceDialogs, getInitialValues, prepareSubmitData,
} from './helper';
import miqRedirectBack from '../../../helpers/miq-redirect-back';
import { API } from '../../../http_api';

const CustomButtonForm = ({
  recId, url, appliesToClass, appliesToId, customButtonGroupId, distinctInstances, ansiblePlaybooks,
}) => {
  const [{
    isLoading, initialValues, buttonIcon, roles, serviceDialogs,
  }, setState] = useState({
    isLoading: !!recId,
  });

  let iconChanged = false;
  const distinctInstancesOptions = distinctInstances.map((instance) => ({ value: instance, label: instance }));
  const ansiblePlaybookOptions = ansiblePlaybooks.map((playbook) => ({ value: playbook.name, label: playbook.name }));
  const redirectUrl = '/generic_object_definition/';

  useEffect(() => {
    getRoles(setState);
    getServiceDialogs(setState);
    getInitialValues(recId, setState);
  }, []);

  iconChanged = (recId && initialValues && initialValues.options)
    ? (initialValues.options.button_icon !== buttonIcon)
    : false;

  const onSubmit = (values) => {
    const submitValues = prepareSubmitData(values, recId, appliesToClass, appliesToId, initialValues, buttonIcon);
    let saveMessage = __(`Custom Button ${submitValues.name} has been successfully saved.`);
    if (recId) {
      API.put(`/api/custom_buttons/${recId}`, submitValues, { skipErrors: [400] })
        .then(() => {
          miqRedirectBack(saveMessage, 'success', redirectUrl);
        })
        .catch((error) => {
          miqRedirectBack(error.data.error.message, 'warning', redirectUrl);
        });
    } else {
      miqSparkleOn();
      // eslint-disable-next-line consistent-return
      API.post('/api/custom_buttons/', submitValues, { skipErrors: [400] }).then((response) => {
        saveMessage = __(`Custom Button ${submitValues.name} has been successfully added.`);
        if (customButtonGroupId) {
          saveMessage = __(`Custom Button ${submitValues.name} has been successfully added under the selected button group.`);
          return http.post(`/generic_object_definition/add_button_in_group/${customButtonGroupId}?button_id=${response.results[0].id}`)
            .then(() => {
              miqRedirectBack(saveMessage, 'success', redirectUrl);
            })
            .catch((error) => {
              miqRedirectBack(error.data.error.message, 'warning', redirectUrl);
            });
        }
        miqRedirectBack(saveMessage, 'success', redirectUrl);
      })
        .catch((error) => {
          miqRedirectBack(error.data.error.message, 'warning', redirectUrl);
        });
    }
  };

  const onCancel = () => {
    if (recId) {
      miqRedirectBack(__(`Edit of Custom Button ${initialValues.name} was canceled by the user.`),
        'warning', redirectUrl);
    } else {
      miqRedirectBack(__('Creation of new Custom Button was canceled by the user.'), 'warning', redirectUrl);
    }
  };

  const onFormReset = () => {
    setState((state) => ({
      ...state,
      buttonIcon: initialValues.options.button_icon,
      isLoading: false,
    }));
    add_flash(__('All changes have been reset'), 'warn');
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return (!isLoading) && (
    <div className="col-md-12 button-form">
      <MiqFormRenderer
        schema={createSchema(distinctInstancesOptions, ansiblePlaybookOptions, roles, serviceDialogs, buttonIcon, url, setState)}
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

CustomButtonForm.propTypes = {
  recId: PropTypes.number,
  url: PropTypes.string,
  distinctInstances: PropTypes.arrayOf(PropTypes.any),
  ansiblePlaybooks: PropTypes.arrayOf(PropTypes.any),
  appliesToClass: PropTypes.string,
  appliesToId: PropTypes.string,
  customButtonGroupId: PropTypes.string,
};

CustomButtonForm.defaultProps = {
  recId: undefined,
  url: '',
  distinctInstances: [],
  ansiblePlaybooks: [],
  appliesToClass: '',
  appliesToId: undefined,
  customButtonGroupId: undefined,
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

export default CustomButtonForm;
