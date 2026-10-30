import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { InlineNotification, Loading } from '@carbon/react';
import componentMapper from '../../forms/mappers/componentMapper';
import createSchema from './ab-form.schema';
import {
  getRoles, getServiceDialogs, getButtonFormData, getInitialValues, buildSubmitData,
} from './helper';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';

const AbForm = ({
  recId = null,
  appliesToClass: appliesToClassProp = '',
  appliesToId = null,
  customButtonGroupId = null,
  formDataUrl = '/miq_ae_customization/ab_button_form_data',
  redirectUrl = '/miq_ae_customization/explorer',
}) => {
  const [{
    isLoading, initialValues, buttonIcon, roles, serviceDialogs, appliesToClass,
    distinctInstances, ansiblePlaybooks,
  }, setState] = useState({
    isLoading: true,
    initialValues: undefined,
    buttonIcon: 'ff ff-action',
    roles: [],
    serviceDialogs: [],
    appliesToClass: appliesToClassProp || '',
    distinctInstances: [],
    ansiblePlaybooks: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashError, setFlashError] = useState(null);

  useEffect(() => {
    Promise.all([
      getRoles(),
      getServiceDialogs(),
      getButtonFormData(formDataUrl),
      getInitialValues(recId),
    ]).then(([fetchedRoles, fetchedDialogs, fetchedFormData, fetchedValues]) => {
      const icon = fetchedValues?.options?.button_icon || 'ff ff-action';
      // For edit, use applies_to_class from the API response
      const resolvedClass = (recId && fetchedValues?.applies_to_class) || appliesToClassProp;
      setState({
        isLoading: false,
        initialValues: {
          // Hidden field so expression-editor towhatField can read applies_to_class
          applies_to_class_field: resolvedClass,
          ...fetchedValues,
        },
        buttonIcon: icon,
        roles: fetchedRoles,
        serviceDialogs: fetchedDialogs,
        appliesToClass: resolvedClass,
        distinctInstances: fetchedFormData.distinct_instances || [],
        ansiblePlaybooks: fetchedFormData.ansible_playbooks || [],
      });
    }).catch((error) => {
      setState((s) => ({ ...s, isLoading: false }));
      setFlashError(error?.data?.error?.message || error?.message || __('An error occurred while loading the form.'));
    });
  }, [recId, appliesToClassProp, formDataUrl]);

  const onSubmit = (values) => {
    if (isSubmitting) {
      return;
    }
    setFlashError(null);
    setIsSubmitting(true);

    const submitData = buildSubmitData(values, recId, appliesToClass, appliesToId, initialValues, buttonIcon);

    const request = recId
      ? API.put(`/api/custom_buttons/${recId}`, submitData)
      : API.post('/api/custom_buttons/', submitData);

    request.then((response) => {
      const message = recId
        ? sprintf(__('Custom Button %s has been successfully saved.'), submitData.name)
        : sprintf(__('Custom Button %s has been successfully added.'), submitData.name);

      const assignFailureMessage = __('Custom Button was saved but could not be assigned. Please assign it manually.');

      // customButtonGroupId and appliesToId are mutually exclusive:
      //   customButtonGroupId — set when adding a button directly under a button group node.
      //   appliesToId         — set when adding a standalone button under a service template node.
      if (!recId && customButtonGroupId) {
        const newId = parseInt(response?.results?.[0]?.id, 10);
        if (!newId) {
          miqRedirectBack(message, 'success', redirectUrl);
          return;
        }
        API.post(`/api/custom_button_sets/${customButtonGroupId}`, { action: 'add_custom_button', button_id: newId })
          .then(() => miqRedirectBack(message, 'success', redirectUrl))
          .catch((error) => {
            setIsSubmitting(false);
            setFlashError(error?.data?.error?.message || assignFailureMessage);
          });
        return;
      }

      if (!recId && appliesToId) {
        const newId = parseInt(response?.results?.[0]?.id, 10);
        if (newId) {
          API.post(`/api/service_templates/${appliesToId}`, { action: 'add_custom_button', button_id: newId })
            .then(() => miqRedirectBack(message, 'success', redirectUrl))
            .catch((error) => {
              setIsSubmitting(false);
              setFlashError(error?.data?.error?.message || assignFailureMessage);
            });
          return;
        }
      }

      miqRedirectBack(message, 'success', redirectUrl);
    }).catch((error) => {
      setIsSubmitting(false);
      setFlashError(error?.data?.error?.message || error?.message || __('An error occurred while saving.'));
    });
  };

  const onCancel = () => {
    const name = initialValues?.name;
    const message = recId
      ? sprintf(__('Edit of Custom Button %s was cancelled by the user.'), name)
      : __('Add of new Custom Button was cancelled by the user.');
    miqRedirectBack(message, 'warning', redirectUrl);
  };

  const onReset = () => {
    setState((s) => ({
      ...s,
      buttonIcon: initialValues?.options?.button_icon || 'ff ff-action',
    }));
  };

  const disabledKeys = recId ? ['pristine', 'invalid'] : ['invalid'];

  if (isLoading) {
    return <Loading active withOverlay={false} />;
  }

  return (
    <div className="ab-form">
      {flashError && (
        <InlineNotification
          kind="error"
          role="alert"
          title={flashError}
          lowContrast
          onCloseButtonClick={() => setFlashError(null)}
        />
      )}
      {initialValues && (
        <MiqFormRenderer
          componentMapper={componentMapper}
          schema={createSchema({
            roles,
            serviceDialogs,
            buttonIcon,
            setState,
            distinctInstances,
            ansiblePlaybooks,
          })}
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onReset={onReset}
          canReset={!!recId}
          disableSubmit={isSubmitting ? ['submitting'] : disabledKeys}
          buttonsLabels={{ submitLabel: recId ? __('Save') : __('Add') }}
        />
      )}
    </div>
  );
};

AbForm.propTypes = {
  recId: PropTypes.number,
  appliesToClass: PropTypes.string,
  appliesToId: PropTypes.string,
  customButtonGroupId: PropTypes.number,
  formDataUrl: PropTypes.string,
  redirectUrl: PropTypes.string,
};

export default AbForm;
