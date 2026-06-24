import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from '@carbon/react';
import createSchema from './ap-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const ApForm = ({
  scanId, scanMode, initialData, copy,
}) => {
  const [{ isLoading, formInitialValues }, setState] = useState({
    isLoading: true,
    formInitialValues: {},
  });

  const isNewRecord = !scanId || scanId === 'new';
  const isCopy = Boolean(copy);

  useEffect(() => {
    // Determine the scan mode: use scanMode prop for new records, otherwise use initialData
    const determinedMode = isNewRecord ? (scanMode || 'Vm') : (initialData?.scan_mode || scanMode || 'Vm');

    // Prepare initial values for DDF
    const categoryData = initialData?.category || {};

    // For checkboxes, only include true values, omit false ones
    const categoryValues = {};
    if (categoryData.system) {
      categoryValues.system = true;
    }
    if (categoryData.services) {
      categoryValues.services = true;
    }
    if (categoryData.software) {
      categoryValues.software = true;
    }
    if (categoryData.accounts) {
      categoryValues.accounts = true;
    }
    if (categoryData.vmconfig) {
      categoryValues.vmconfig = true;
    }

    // Rails controller already prefixes the name with "Copy of " for copy operations
    const profileName = initialData?.name || '';

    const preparedValues = {
      name: profileName,
      description: initialData?.description || '',
      scan_mode: determinedMode,
      category: categoryValues,
      file_names: initialData?.file_names || [],
      reg_entries: initialData?.reg_entries || [],
      nteventlog_entries: initialData?.nteventlog_entries || [],
    };

    setState({
      isLoading: false,
      formInitialValues: preparedValues,
    });
  }, [initialData, scanMode, isNewRecord, isCopy]);

  const onSubmit = (values) => {
    // Validate required fields
    if (!values.name || values.name.trim() === '') {
      add_flash(__('Name is required'), 'error');
      return;
    }

    const isHostMode = values.scan_mode === 'Host';

    // Collect category selections from nested object (only for Vm mode)
    const categoryObj = values.category || {};
    const categorySelections = Object.keys(categoryObj).filter((key) => categoryObj[key]);

    // Check if at least one item type has content
    const hasContent = (!isHostMode && categorySelections.length > 0)
      || (values.file_names && values.file_names.length > 0)
      || (!isHostMode && values.reg_entries && values.reg_entries.length > 0)
      || (values.nteventlog_entries && values.nteventlog_entries.length > 0);

    if (!hasContent) {
      add_flash(__('At least one item must be entered to create Analysis Profile'), 'error');
      return;
    }

    // Prepare form data for submission
    const formData = {
      name: values.name,
      description: values.description,
      scan_mode: values.scan_mode,
      category: isHostMode ? [] : categorySelections,
      file: values.file_names || [],
      registry: isHostMode ? [] : (values.reg_entries || []),
      nteventlog: values.nteventlog_entries || [],
    };

    miqSparkleOn();
    const url = `/ops/ap_edit?id=${scanId || 'new'}&button=${isNewRecord ? 'add' : 'save'}`;
    http.post(url, { form_data: JSON.stringify(formData) })
      .then((response) => {
        miqSparkleOff();
        if (response.data && response.data.error) {
          add_flash(response.data.error, 'error');
        } else {
          const message = response.data?.message || __('Analysis Profile was saved');
          miqRedirectBack(message, 'success', '/ops/explorer');
        }
      })
      .catch((error) => {
        miqSparkleOff();
        const errorMsg = error.response?.data?.error || error.message || __('An error occurred while saving');
        add_flash(errorMsg, 'error');
      });
  };

  const onCancel = () => {
    let message;
    if (isCopy) {
      message = __('Copy of Analysis Profile was cancelled by the user');
    } else if (isNewRecord) {
      message = __('Add of new Analysis Profile was cancelled by the user');
    } else {
      message = __('Edit of Analysis Profile was cancelled by the user');
    }
    miqRedirectBack(message, 'warning', '/ops/explorer');
  };

  if (isLoading) {
    return <Loading active withOverlay={false} />;
  }

  const isHostMode = formInitialValues.scan_mode === 'Host';

  return (
    <div className="ap-form">
      <MiqFormRenderer
        schema={createSchema(isHostMode)}
        initialValues={formInitialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset={!isNewRecord && !isCopy}
        buttonsLabels={{
          submitLabel: (isNewRecord || isCopy) ? __('Add') : __('Save'),
        }}
      />
    </div>
  );
};

ApForm.propTypes = {
  scanId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  scanMode: PropTypes.string,
  copy: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  initialData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    scan_mode: PropTypes.string,
    category: PropTypes.objectOf(PropTypes.bool),
    file_names: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.string,
      content: PropTypes.bool,
    })),
    reg_entries: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    })),
    nteventlog_entries: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      filter: PropTypes.shape({
        message: PropTypes.string,
        level: PropTypes.string,
        source: PropTypes.string,
        num_days: PropTypes.number,
      }),
    })),
  }),
};

ApForm.defaultProps = {
  scanId: 'new',
  scanMode: 'Vm',
  copy: false,
  initialData: null,
};

export default ApForm;
