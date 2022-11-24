import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'carbon-components-react';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import MiqDataTable from '../miq-data-table';
import { createRows, setupForm, prepareData } from './helper';

const TenantQuotaForm = ({ recordId }) => {
  const [{ initialValues, isLoading }, setState] = useState({ isLoading: !!recordId });
  const [enforced, setEnforced] = useState({});
  const [values, setValues] = useState({});
  const [disabled, setDisabled] = useState(true);
  const [changed, setChanged] = useState(true);
  const [invalid, setInvalid] = useState({});
  const submitLabel = !!recordId ? __('Save') : __('Add');

  useEffect(() => {
    if (recordId) {
      miqSparkleOn();
      API.get(`/api/tenants/${recordId}`).then(({ name }) => {
        API.options(`/api/tenants/${recordId}/quotas`).then((initialValues) => {
          API.get(`/api/tenants/${recordId}/quotas?expand=resources`).then(({ resources }) => {
            const modifiedInitialValues = setupForm(initialValues, resources, name);
            setEnforced(() => ({ ...modifiedInitialValues.enforced }));
            setValues(() => ({ ...modifiedInitialValues.values }));
            setInvalid(() => ({ ...modifiedInitialValues.invalid }));
            setState({ initialValues: modifiedInitialValues, isLoading: false });
          });
        });
      });
      miqSparkleOff();
    }
  }, [recordId]);

  const onSubmit = () => {
    const { quotasToCreate, quotasToEdit, quotasToDelete } = prepareData(initialValues, values);
    const promises = [];
    miqSparkleOn();

    if (quotasToCreate.resources.length !== 0) { promises.push(API.post(`/api/tenants/${recordId}/quotas`, quotasToCreate)); }
    if (quotasToEdit.resources.length !== 0) { promises.push(API.post(`/api/tenants/${recordId}/quotas`, quotasToEdit)); }
    if (quotasToDelete.resources.length !== 0) { promises.push(API.post(`/api/tenants/${recordId}/quotas`, quotasToDelete)); }

    Promise.all(promises).then(() => {
      const message = sprintf(__('Quotas for Tenant "%s" were saved'), initialValues.name);
      miqRedirectBack(message, undefined, '/ops/explorer');
    }).catch(miqSparkleOff);
  };

  const onReset = () => {
    setEnforced(() => ({ ...initialValues.enforced }));
    setValues(() => ({ ...initialValues.values }));
    setDisabled(true);
    setChanged(true);
    setInvalid(() => ({ ...initialValues.invalid }));
    // eslint-disable-next-line no-return-assign
    Array.from(document.querySelectorAll('.quota-table-input')).forEach((input, index) => input.value = initialValues.values[index]);
    add_flash(__('All changes have been reset'), 'warn');
  };

  const onCancel = () => {
    const message = sprintf(__('Manage quotas for Tenant "%s" was cancelled by the user'), initialValues.name);
    miqRedirectBack(message, 'warning', '/ops/explorer');
  };

  return !isLoading && (
    <div className="tenant-quota-data-table">
      <MiqDataTable
        headers={[
          { key: 'Enforced', header: __('Enforced') },
          { key: 'Description', header: __('Description') },
          { key: 'Value', header: __('Value') },
          { key: 'Units', header: __('Units') },
        ]}
        rows={createRows(initialValues, enforced, setEnforced, values, setValues, setDisabled, setChanged, invalid, setInvalid)}
        onCellClick={() => {}}
      />
      <div className="bx--btn-set">
        <Button kind="primary" tabIndex={0} disabled={disabled} type="submit" onClick={onSubmit}>
          {submitLabel}
        </Button>
        <Button kind="secondary" style={{ marginLeft: '10px' }} tabIndex={0} disabled={changed} type="reset" onClick={onReset}>
          {__('Reset')}
        </Button>
        <Button kind="secondary" style={{ marginLeft: '10px' }} tabIndex={0} type="button" onClick={onCancel}>
          {__('Cancel')}
        </Button>
      </div>
    </div>
  );
};

TenantQuotaForm.propTypes = {
  recordId: PropTypes.string,
};
TenantQuotaForm.defaultProps = {
  recordId: undefined,
};

export default TenantQuotaForm;
