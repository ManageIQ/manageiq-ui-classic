import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Loading, InlineNotification, InlineLoading,
} from '@carbon/react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { http } from '../../http_api';
import createSchema from './review-import-form.schema';
import CheckboxTreeComponent from '../tree-view/checkbox_tree';
import defaultComponentMapper from '../../forms/mappers/componentMapper';

const ReviewImportForm = ({
  importFileUploadId, onClose, onImportComplete,
}) => {
  const [loading, setLoading] = useState(true);
  const [importData, setImportData] = useState(null);
  const [existingDomains, setExistingDomains] = useState([]);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (importFileUploadId) {
      // Fetch both import data and existing domains in parallel
      Promise.all([
        http.get(`/miq_ae_tools/automate_json?import_file_upload_id=${importFileUploadId}`),
        API.get('/api/automate_domains?expand=resources&attributes=name,enabled,source&filter[]=enabled=true&filter[]=source=user'),
      ])
        .then(([importResponse, domainsResponse]) => {
          // Parse import data
          const data = typeof importResponse === 'string' ? JSON.parse(importResponse) : importResponse;
          setImportData(data);

          // Extract domain names from API response
          const domains = domainsResponse?.resources || [];
          const domainNames = domains.map((domain) => domain.name);
          setExistingDomains(domainNames);

          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load data');
          setLoading(false);
        });
    }
  }, [importFileUploadId]);

  const handleSubmit = (values) => {
    setImporting(true);
    setError(null);

    // Extract string values from dropdown objects
    const domainFrom = typeof values.selected_domain_to_import_from === 'object'
      ? values.selected_domain_to_import_from.value
      : values.selected_domain_to_import_from;
    const domainTo = typeof values.selected_domain_to_import_to === 'object'
      ? values.selected_domain_to_import_to.value
      : values.selected_domain_to_import_to;

    const params = {
      import_file_upload_id: importFileUploadId,
      selected_namespaces: values.selected_namespaces || [],
      selected_domain_to_import_from: domainFrom,
      selected_domain_to_import_to: domainTo,
    };

    return http.post('/miq_ae_tools/import_automate_datastore', params)
      .then((response) => {
        if (response && response.length > 0) {
          miqFlashLater(response[0]); // eslint-disable-line no-undef
        }
        if (onImportComplete) {
          onImportComplete();
        }
        onClose();
      })
      .catch((err) => {
        setError(err.message || 'Import failed');
        setImporting(false);
        throw err;
      });
  };

  const handleCancel = () => {
    if (importFileUploadId) {
      http.post('/miq_ae_tools/cancel_import', { import_file_upload_id: importFileUploadId })
        .catch(() => {
          // Ignore errors on cancel
        });
    }
    onClose();
  };

  // Get initial values from import data
  const getInitialValues = () => {
    if (!importData || !Array.isArray(importData) || importData.length === 0) {
      return {};
    }

    const firstDomain = importData[0];
    const allNamespaceKeys = firstDomain.nodes ? firstDomain.nodes.map((ns) => ns.key) : [];

    // Default "Import to Domain" to the first existing domain, not the file domain
    const defaultImportToDomain = existingDomains && existingDomains.length > 0 ? existingDomains[0] : firstDomain.text;

    return {
      selected_domain_to_import_from: firstDomain.text,
      selected_domain_to_import_to: defaultImportToDomain,
      selected_namespaces: allNamespaceKeys, // Select all by default
    };
  };

  // Get namespaces for the selected domain
  const getNamespacesForDomain = (domainName) => {
    if (!importData || !Array.isArray(importData)) {
      return [];
    }
    const domain = importData.find((d) => d.text === domainName);
    return domain && domain.nodes ? domain.nodes : [];
  };

  // Memoize schema to ensure getNamespacesForDomain closure has latest importData
  const schema = useMemo(() => {
    if (!importData || !existingDomains) {
      return null;
    }
    return createSchema(importData, existingDomains, getNamespacesForDomain);
  }, [importData, existingDomains]);

  return (
    <Modal
      open
      modalHeading={__('Review Datastore Import')}
      passiveModal
      onRequestClose={handleCancel}
      size="lg"
    >
      {loading && <Loading description={__('Loading import data...')} />}

      {error && (
        <InlineNotification
          kind="error"
          title={__('Error')}
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
        />
      )}

      {importing && (
        <div style={{ padding: '1rem' }}>
          <InlineLoading description={__('Importing datastore...')} />
        </div>
      )}

      {!loading && !importing && importData && Array.isArray(importData) && importData.length > 0 && existingDomains.length > 0 && (
        <MiqFormRenderer
          initialValues={getInitialValues()}
          schema={schema}
          componentMapper={{
            ...defaultComponentMapper,
            'namespace-tree-checkbox': CheckboxTreeComponent,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          buttonsLabels={{
            submitLabel: __('Commit'),
            cancelLabel: __('Cancel'),
          }}
          disableSubmit={importing ? ['pristine', 'invalid', 'dirty'] : ['pristine', 'invalid']}
          subscription={{ values: true }}
        />
      )}

      {!loading && importData && Array.isArray(importData) && importData.length > 0 && existingDomains.length === 0 && (
        <InlineNotification
          kind="warning"
          title={__('No Domains Available')}
          subtitle={__('No enabled domains available to import to')}
        />
      )}

      {!loading && (!importData || !Array.isArray(importData) || importData.length === 0) && (
        <InlineNotification
          kind="warning"
          title={__('No Data')}
          subtitle={__('No domains found in the import file')}
        />
      )}
    </Modal>
  );
};

ReviewImportForm.propTypes = {
  importFileUploadId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onImportComplete: PropTypes.func,
};

ReviewImportForm.defaultProps = {
  onImportComplete: null,
};

export default ReviewImportForm;
