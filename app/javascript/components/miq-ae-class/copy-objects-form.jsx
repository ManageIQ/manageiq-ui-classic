import { useState, useEffect } from 'react';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import { Button } from '@carbon/react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './copy-objects-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { http } from '../../http_api';

const CopyObjectsForm = ({ recordId, editData }) => {
  const [data, setData] = useState({
    isLoading: true,
    initialValues: undefined,
  });

  useEffect(() => {
    if (editData) {
      // Transform domains object to array format for select component
      const domainsArray = Object.entries(editData.domains).map(([value, label]) => ({
        value,
        label,
      }));

      // Transform selected items object to array
      const selectedItemsArray = Object.values(editData.selected_items);

      const initialValues = {
        from_domain: editData.domain_name,
        domain: String(editData.new.domain),
        new_name: editData.new.new_name || '',
        override_source: editData.new.override_source,
        override_existing: editData.new.override_existing || false,
        namespace: editData.new.namespace || '',
        is_single_item: selectedItemsArray.length === 1,
        is_same_domain: editData.new.domain === editData.domain_id,
        show_override_existing: ['MiqAeInstance', 'MiqAeMethod'].includes(editData.typ),
      };

      setData({
        isLoading: false,
        initialValues,
        domains: domainsArray,
        selectedItems: selectedItemsArray,
        domainName: editData.domain_name,
        typeName: editData.typ,
        domainId: editData.domain_id,
      });
    }
  }, [editData]);

  const onSubmit = (values) => {
    miqSparkleOn();

    const params = {
      domain: values.domain,
      override_source: values.override_source ? '1' : '0',
      override_existing: values.override_existing ? '1' : '0',
      namespace: values.namespace,
      new_name: values.new_name,
    };

    http.post(`/miq_ae_class/copy_objects_save/${recordId}`, params)
      .then((response) => {
        const message = response.message || __('Copy operation completed successfully');
        miqRedirectBack(message, 'success', response.redirect_url || '/miq_ae_class/explorer');
      })
      .catch((error) => {
        miqSparkleOff();
        const errorMessage = error.response?.data?.error || error.message || __('Error during copy operation');
        add_flash(errorMessage, 'error');
      });
  };

  const onCancel = () => {
    const message = __('Copy operation was cancelled by the user');
    miqRedirectBack(message, 'warning', '/miq_ae_class/explorer');
  };

  const onReset = () => {
    // For React form, reset just reloads the page to get fresh data
    window.location.reload();
  };

  if (data.isLoading) {
    return null;
  }

  return (
    <div className="dialog-provision-form">
      <MiqFormRenderer
        schema={createSchema(
          data.domains,
          data.selectedItems,
          data.domainName,
          data.typeName,
          data.initialValues.is_single_item,
          data.initialValues.is_same_domain,
          data.initialValues.show_override_existing,
          data.domainId
        )}
        initialValues={data.initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset
        onReset={onReset}
        FormTemplate={(props) => <FormTemplate {...props} />}
      />
    </div>
  );
};

const FormTemplate = ({ formFields }) => {
  const {
    handleSubmit, onReset, onCancel, getState,
  } = useFormApi();
  const { valid, pristine } = getState();

  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {() => (
          <div className="custom-button-wrapper">
            <Button
              disabled={!valid || pristine}
              kind="primary"
              className="btnRight"
              type="submit"
            >
              {__('Copy')}
            </Button>
            <Button
              disabled={pristine}
              kind="secondary"
              className="btnRight"
              onClick={onReset}
              type="button"
            >
              {__('Reset')}
            </Button>
            <Button type="button" onClick={onCancel} kind="secondary">
              {__('Cancel')}
            </Button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

CopyObjectsForm.propTypes = {
  recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  editData: PropTypes.shape({
    typ: PropTypes.string,
    domain_name: PropTypes.string,
    domain_id: PropTypes.number,
    domains: PropTypes.objectOf(PropTypes.string),
    selected_items: PropTypes.objectOf(PropTypes.string),
    new: PropTypes.shape({
      domain: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      override_source: PropTypes.bool,
      override_existing: PropTypes.bool,
      namespace: PropTypes.string,
      new_name: PropTypes.string,
    }),
  }).isRequired,
};

FormTemplate.propTypes = {
  formFields: PropTypes.node.isRequired,
};

export default CopyObjectsForm;
