import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './schema';
import componentMapper from '../../forms/mappers/componentMapper';
import {
  KeyValueListComponent,
  CopyFromProvisonButton,
  TreeViewReduxWrapper,
  conditionalCheckbox,
  prepareRequestObject,
  restructureCatalogData,
  getLogOutputTypes,
  getVerbosityTypes,
  formCloudTypes,
  restructureAvailableCatalogs,
  formCatalogData,
} from './helper';

import miqRedirectBack from '../../helpers/miq-redirect-back';

const AnsiblePlayBookEditCatalogForm = ({ initialData }) => {
  const [data, setData] = useState({
    isLoading: true,
    formData: {},
    currencies: [],
    repositories: [],
    provisionPlayBookId: '',
    retirementPlayBookId: '',
    machineCredentials: [],
    vaultCredentials: [],
    cloudTypes: [],
    zones: [],
    availableCatalogs: [],
    dialogs: [],
    provisionCloudType: '',
    retirementCloudType: '',
    provisionEsclationDisplay: false,
    retirementEsclationDisplay: false,
  });

  useEffect(() => {
    // eslint-disable-next-line max-len
    const getServiceTemplates = initialData.catalogFormId !== 'new' ? API.get(`/api/service_templates/${initialData.catalogFormId}`) : Promise.resolve({});
    const getCurrencies = API.get('/api/currencies/?expand=resources&attributes=id,full_name,symbol,code&sort_by=full_name&sort_order=ascending');
    // eslint-disable-next-line max-len
    const getRepositories = API.get(`/api/configuration_script_sources?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource&expand=resources&attributes=id,name&filter[]=region_number=${initialData.currentRegion}&sort_by=name&sort_order=ascending`);
    // eslint-disable-next-line max-len
    const getMachineCredentails = API.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::MachineCredential&expand=resources&attributes=id,name,options&sort_by=name&sort_order=ascending');
    // eslint-disable-next-line max-len
    const getValutCredantials = API.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::VaultCredential&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending');
    const getCloudTypes = API.options('/api/authentications');
    const getZones = API.get('/api/zones/?expand=resources&attributes=id,description,visible&sort_by=description&sort_order=ascending');
    const getAvailableCatalogs = API.get('/api/service_catalogs/?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending');
    const getAvailableDailogs = API.get('/api/service_dialogs/?expand=resources&attributes=id,label&sort_by=label&sort_order=ascending');
    Promise.all([
      getServiceTemplates,
      getCurrencies,
      getRepositories,
      getMachineCredentails,
      getValutCredantials,
      getCloudTypes,
      getZones,
      getAvailableCatalogs,
      getAvailableDailogs,
    ])
      .then(async(responses) => {
        let provisionCloudType = '';
        let retirementCloudType = '';
        const catalogData = { ...responses[0] };
        const currenciesData = { ...responses[1] };
        const repositories = { ...responses[2].resources };
        const machineCredentials = { ...responses[3].resources };
        const vaultCredentials = { ...responses[4].resources };
        const cloudTypes = formCloudTypes(responses[5]);
        const zones = {
          ...responses[6].resources.filter((zone) => zone.visible === true),
        };
        const availableCatalogs = restructureAvailableCatalogs(responses[7].resources, initialData.allCatalogs);
        const dialogs = { ...responses[8].resources };

        if (initialData.catalogFormId !== 'new') {
          // fetch cloudtype corresponding to a  specific cloud_credantial-id
          if (catalogData.config_info.provision.cloud_credential_id) {
            const getSpecificCloudType = API.get(`/api/authentications/${catalogData.config_info.provision.cloud_credential_id}`);
            const result = await Promise.resolve(getSpecificCloudType);
            provisionCloudType = result.type;
          }
          if (catalogData.config_info.retirement.cloud_credential_id) {
            const getSpecificCloudType = API.get(`/api/authentications/${catalogData.config_info.retirement.cloud_credential_id}`);
            const result = await Promise.resolve(getSpecificCloudType);
            retirementCloudType = result.type;
          }

          setData({
            isLoading: false,
            formData: restructureCatalogData(catalogData, provisionCloudType, retirementCloudType),
            currencies: currenciesData.resources,
            repositories,
            provisionRepositoryId: catalogData.config_info.provision.repository_id,
            retirementRepositoryId: catalogData.config_info.retirement.repository_id,
            machineCredentials,
            vaultCredentials,
            cloudTypes,
            zones,
            availableCatalogs,
            dialogs,
            provisionCloudType,
            retirementCloudType,
            provisionEsclationDisplay: !!(catalogData.config_info.provision.become_method),
            retirementEsclationDisplay: !!(catalogData.config_info.retirement.become_method),
          });
        } else {
          setData({
            isLoading: false,
            formData: formCatalogData(),
            currencies: currenciesData.resources,
            repositories,
            provisionRepositoryId: '',
            retirementRepositoryId: '',
            machineCredentials,
            vaultCredentials,
            cloudTypes,
            zones,
            availableCatalogs,
            dialogs,
            provisionCloudType: '',
            retirementCloudType: '',
            provisionEsclationDisplay: false,
            retirementEsclationDisplay: false,
          });
        }
      });
  }, [initialData.catalogFormId]);

  const onCancel = () => {
    const msg = sprintf(__('Edit of Catalog Item %s was cancelled by the user'), data.formData.description);
    // eslint-disable-next-line no-undef
    miqFlashLater({ message: msg });
    window.location.href = '/catalog/explorer?';
  };

  const onSubmit = (values) => {
    const requestObject = prepareRequestObject(values, initialData.catalogFormId);
    // eslint-disable-next-line max-len
    const redirectUrl = initialData.catalogFormId === 'new' ? `/catalog/explorer/${initialData.catalogFormId}?button=add` : `/catalog/explorer/${initialData.catalogFormId}?button=save`;
    const url = initialData.catalogFormId === 'new' ? `/api/service_templates` : `/api/service_templates/${initialData.catalogFormId}`;
    const action = initialData.catalogFormId === 'new' ? 'create' : 'edit';
    API.post(url, { resource: requestObject, action, skipErrors: [400] })
      .then((_response) => {
        // eslint-disable-next-line max-len
        const successMsg = initialData.catalogFormId === 'new' ? sprintf(__('Catalog Item %s was added'), values.name) : sprintf(__('Catalog Item %s was saved'), values.name);
        miqRedirectBack(successMsg, 'success', redirectUrl);
      }).catch(({ data }) => {
        const errorMessage = `${__(data.error.klass)}: ${__(data.error.message)}`;
        miqRedirectBack(errorMessage, 'error', redirectUrl);
      });
  };

  const mapper = {
    ...componentMapper,
    'key-value-list': KeyValueListComponent,
    'copy-from-provisioning': CopyFromProvisonButton,
    'tree-view-redux': TreeViewReduxWrapper,
    'conditional-checkbox': conditionalCheckbox,
  };

  const customValidatorMapper = {
    customValidatorForRetirementFields: () => (value, allValues) => {
      if (!value && allValues.config_info.retirement.repository_id) {
        return __('Required');
      }
      return false;
    },

    customValidatorForPrice: () => (value, allValues) => {
      if (!value && allValues.currency_id) {
        return __('Required');
      }
      return false;
    },
  };

  return !data.isLoading && (
    <MiqFormRenderer
      onSubmit={onSubmit}
      componentMapper={mapper}
      validatorMapper={customValidatorMapper}
      initialValues={data.formData}
      onCancel={onCancel}
      schema={createSchema({
        data,
        setData,
        logOutputTypes: getLogOutputTypes(),
        verbosityTypes: getVerbosityTypes(),
        initialData,
      })}
      canReset={!!initialData.catalogFormId}
    />
  );
};

AnsiblePlayBookEditCatalogForm.propTypes = {
  initialData: PropTypes.shape({
    catalogFormId: PropTypes.string.isRequired,
    allCatalogs: PropTypes.arrayOf(PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    )).isRequired,
    zones: PropTypes.arrayOf(PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    )).isRequired,
    currentRegion: PropTypes.number.isRequired,
    tenantTree: PropTypes.shape({
      additional_tenants: PropTypes.arrayOf(PropTypes.any).isRequired,
      selectable: PropTypes.bool.isRequired,
      ansible_playbook: PropTypes.bool.isRequired,
      catalog_bundle: PropTypes.bool.isRequired,
      locals_for_render: PropTypes.shape({
        tree_id: PropTypes.string.isRequired,
        tree_name: PropTypes.string.isRequired,
        bs_tree: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    roleAllows: PropTypes.bool.isRequired,
  }).isRequired,
};

export default AnsiblePlayBookEditCatalogForm;
