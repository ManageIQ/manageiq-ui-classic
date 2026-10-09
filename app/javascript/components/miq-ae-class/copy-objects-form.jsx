import { useState, useEffect, useRef } from 'react';
import { FormSpy, useFormApi as useDDFFormApi } from '@data-driven-forms/react-form-renderer';
import { Button, InlineNotification } from '@carbon/react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './copy-objects-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const CopyObjectsForm = ({ recordId, editData }) => {
  const [data, setData] = useState({
    isLoading: true,
    initialValues: undefined,
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        fqname: editData.fqname,
        oldName: editData.old_name,
        selectedIds: editData.selected_ids,
      });
    }
  }, [editData]);

  const onSubmit = (values) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const params = {
      domain: values.domain,
      override_source: values.override_source ? '1' : '0',
      override_existing: values.override_existing ? '1' : '0',
      namespace: values.namespace,
      new_name: values.new_name,
      fqname: data.fqname,
      old_name: data.oldName,
      selected_ids: data.selectedIds,
    };

    http.post(`/miq_ae_class/copy_objects_save/${recordId}`, params, { skipErrors: [400] })
      .then((response) => {
        const message = response.message || __('Copy operation completed successfully');
        miqRedirectBack(message, 'success', response.redirect_url || '/miq_ae_class/explorer');
      })
      .catch((error) => {
        setIsSubmitting(false);
        setErrorMessage(error.data?.error || error.message || __('Error during copy operation'));
      });
  };

  const onCancel = () => {
    const message = __('Copy operation was cancelled by the user');
    miqRedirectBack(message, 'warning', '/miq_ae_class/explorer');
  };

  const onReset = () => {
    add_flash(__('All changes have been reset'), 'warning');
  };

  if (data.isLoading) {
    return null;
  }

  return (
    <div className="dialog-provision-form">
      {errorMessage && (
        <InlineNotification
          kind="error"
          role="alert"
          title={errorMessage}
          lowContrast
          onCloseButtonClick={() => setErrorMessage(null)}
        />
      )}
      <MiqFormRenderer
        schema={createSchema(
          data.domains,
          data.selectedItems,
          data.domainName,
          data.initialValues.is_single_item,
          data.initialValues.show_override_existing,
          data.domainId
        )}
        initialValues={data.initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset
        onReset={onReset}
        FormTemplate={(props) => <FormTemplate {...props} isSubmitting={isSubmitting} />}
      />
    </div>
  );
};

const FormTemplate = ({ formFields, isSubmitting }) => {
  const { handleSubmit, onReset, onCancel } = useFormApi();

  const DomainWatcherInner = ({ domain }) => {
    const { change } = useDDFFormApi();
    const domainRef = useRef(undefined);

    useEffect(() => {
      if (domainRef.current !== undefined && domainRef.current !== domain) {
        change('namespace', '');
      }
      domainRef.current = domain;
    }, [domain]);

    return null;
  };

  const DomainWatcher = () => (
    <FormSpy subscription={{ values: true }}>
      {({ values }) => <DomainWatcherInner domain={values.domain} />}
    </FormSpy>
  );

  return (
    <form onSubmit={handleSubmit}>
      <DomainWatcher />
      {formFields}
      <FormSpy subscription={{ values: true, valid: true, pristine: true }}>
        {({ values, valid, pristine }) => {
          const canCopy = !pristine && valid && (values.override_source || !!values.namespace);
          return (
            <div className="custom-button-wrapper">
              <Button
                disabled={isSubmitting || !canCopy}
                kind="primary"
                className="btnRight"
                type="submit"
              >
                {__('Copy')}
              </Button>
              <Button
                disabled={isSubmitting || pristine}
                kind="secondary"
                className="btnRight"
                onClick={onReset}
                type="button"
              >
                {__('Reset')}
              </Button>
              <Button disabled={isSubmitting} type="button" onClick={onCancel} kind="secondary">
                {__('Cancel')}
              </Button>
            </div>
          );
        }}
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
    fqname: PropTypes.string,
    old_name: PropTypes.string,
    selected_ids: PropTypes.arrayOf(PropTypes.number),
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
  isSubmitting: PropTypes.bool.isRequired,
};

export default CopyObjectsForm;
