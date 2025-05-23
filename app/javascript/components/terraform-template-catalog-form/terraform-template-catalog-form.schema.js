import { componentTypes, validatorTypes } from '@@ddf';
import {
  transformObjectToSelectOptions,
  transformCurrenciesOptions,
  transformZonesOptions,
  transformGeneralOptions,
  transformcloudTypesOptions,
  loadCloudCredentialOptions,
  loadRepositoryOptions,
} from './schemaHelper';

const basicInformationTabSchema = (availableCatalogs, tenantTree, roleAllows, zones, currencies) => {
  const schema = {
    component: componentTypes.TAB_ITEM,
    id: 'basic-information-tab',
    name: 'basic-information-tab',
    label: __('Basic Information'),
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        id: 'name',
        name: 'name',
        label: __('Name'),
        validate: [{ type: validatorTypes.REQUIRED }],
        isRequired: true,
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'description',
        id: 'description',
        label: __('Description'),
      },
      {
        component: componentTypes.CHECKBOX,
        name: 'display',
        id: 'display',
        label: __('Display in Catalog'),
      },
      {
        component: componentTypes.TEXTAREA,
        name: 'long_description',
        id: 'long_description',
        label: __('Long Description'),
        condition: {
          when: 'display',
          is: true,
        },
        rows: 10,
      },
      {
        component: componentTypes.SELECT,
        id: 'service_template_catalog_id',
        name: 'service_template_catalog_id',
        label: __('Catalog'),
        options: transformGeneralOptions([{ value: '', label: '<Unassigned>' }, ...availableCatalogs]),
      },
      {
        component: 'tree-view-redux',
        label: __('Additional Tenants'),
        roleAllows,
        name: 'additional_tenants',
        ...tenantTree.locals_for_render,
      },
      {
        component: componentTypes.SELECT,
        id: 'zone_id',
        name: 'zone_id',
        label: __('Zone'),
        options: transformZonesOptions(zones),
        includeEmpty: true,
      },
      {
        component: componentTypes.SELECT,
        id: 'currency_id',
        name: 'currency_id',
        label: __('Select currency'),
        options: transformCurrenciesOptions(currencies),
        includeEmpty: true,
      },
      {
        component: componentTypes.TEXT_FIELD,
        id: 'price',
        name: 'price',
        label: __('Price / Month'),
        dataType: 'number',
        validateOnMount: true,
        validate: [{ type: 'customValidatorForPrice' }],
      },
    ],
  };
  return schema;
};

const provisionTabSchema = (
  repositories,
  setData,
  provisionRepositoryId,
  currentRegion,
  provisionEsclationDisplay,
  cloudTypes,
  provisionCloudType,
  logOutputTypes,
  verbosityTypes,
  dialogs
) => {
  const schema = {
    component: componentTypes.TAB_ITEM,
    id: 'provisioning-tab',
    name: 'provisioning-tab',
    label: __('Provisioning'),
    fields: [
      {
        component: componentTypes.SELECT,
        id: 'config_info.provision.repository_id',
        name: 'config_info.provision.repository_id',
        label: __('Repository'),
        options: transformGeneralOptions(repositories),
        onChange: (repositoryId) => setData((state) => ({ ...state, provisionRepositoryId: repositoryId })),
        validate: [{ type: validatorTypes.REQUIRED }],
        isRequired: true,
        includeEmpty: true,
      },
      {
        component: componentTypes.SELECT,
        id: 'config_info.provision.configuration_script_payload_id',
        name: 'config_info.provision.configuration_script_payload_id',
        label: __('Template'),
        loadOptions: () => (provisionRepositoryId ? loadRepositoryOptions(provisionRepositoryId, currentRegion) : Promise.resolve([])),
        validate: [{ type: validatorTypes.REQUIRED }],
        condition: {
          when: 'config_info.provision.repository_id',
          isNotEmpty: true,
        },
        key: provisionRepositoryId,
        isRequired: true,
        validateOnMount: true,
        includeEmpty: true,
      },
      {
        component: 'conditional-checkbox',
        id: 'config_info.provision.become_method',
        name: 'config_info.provision.become_method',
        label: __('Escalate Privilege'),
        display: provisionEsclationDisplay,
      },
      {
        component: componentTypes.SELECT,
        id: 'config_info.provision.cloud_type',
        name: 'config_info.provision.cloud_type',
        label: __('Cloud Type'),
        options: transformcloudTypesOptions(cloudTypes),
        onChange: (cloudType) => setData((state) => ({ ...state, provisionCloudType: cloudType })),
        condition: {
          when: 'config_info.provision.repository_id',
          isNotEmpty: true,
        },
        includeEmpty: true,
      },
      {
        component: componentTypes.SELECT,
        id: 'config_info.provision.credential_id',
        name: 'config_info.provision.credential_id',
        label: __('Credential'),
        loadOptions: () => (provisionCloudType ? loadCloudCredentialOptions(provisionCloudType) : Promise.resolve([])),
        key: `${provisionCloudType}-provision-cloud-credential-id`,
        condition: {
          and: [
            {
              when: 'config_info.provision.cloud_type',
              isNotEmpty: true,
            },
            {
              when: 'config_info.provision.repository_id',
              isNotEmpty: true,
            },
          ],
        },
        includeEmpty: true,
      },
      {
        component: componentTypes.TEXT_FIELD,
        id: 'config_info.provision.execution_ttl',
        name: 'config_info.provision.execution_ttl',
        label: __('Max TTL (mins)'),
        dataType: 'number',
      },
      {
        component: componentTypes.SELECT,
        id: 'config_info.provision.log_output',
        name: 'config_info.provision.log_output',
        label: __('Logging Output'),
        options: transformObjectToSelectOptions(logOutputTypes),
      },
      {
        component: componentTypes.SELECT,
        id: 'config_info.provision.verbosity',
        name: 'config_info.provision.verbosity',
        label: __('Verbosity'),
        options: transformObjectToSelectOptions(verbosityTypes),
      },
      {
        component: componentTypes.RADIO,
        id: 'config_info.provision.dialog_type',
        name: 'config_info.provision.dialog_type',
        label: __('Dialog'),
        options: [{ value: 'useExisting', label: __('Use Existing') }, { value: 'createNew', label: __('Create New') }],
      },
      {
        component: componentTypes.SELECT,
        id: 'config_info.provision.dialog_id',
        name: 'config_info.provision.dialog_id',
        label: __('Existing Dialog'),
        options: transformGeneralOptions(dialogs),
        condition: {
          when: 'config_info.provision.dialog_type',
          is: 'useExisting',
        },
        includeEmpty: true,
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.TEXT_FIELD,
        id: 'config_info.provision.new_dialog_name',
        name: 'config_info.provision.new_dialog_name',
        label: __('Enter a new Dialog'),
        maxLength: 255,
        isRequired: true,
        condition: {
          when: 'config_info.provision.dialog_type',
          is: 'createNew',
        },
        validate: [{ type: validatorTypes.REQUIRED }],
      },
    ],
  };
  return schema;
};


const createSchema = ({
  data,
  setData,
  logOutputTypes,
  verbosityTypes,
  initialData,
}) => {
  const {
    availableCatalogs,
    zones,
    currencies,
    repositories,
    provisionRepositoryId,
    cloudTypes,
    dialogs,
    provisionCloudType,
    provisionEsclationDisplay,
  } = data;

  const {
    tenantTree,
    roleAllows,
    currentRegion,
  } = initialData;

  const fields = [
    {
      component: componentTypes.TABS,
      id: 'catalog-tabs-edit-terraform-templates',
      name: 'catalog-tabs-edit-terraform-templates',
      fields: [
        {
          ...basicInformationTabSchema(
            availableCatalogs,
            tenantTree,
            roleAllows,
            zones,
            currencies
          ),
        },
        {
          ...provisionTabSchema(
            repositories,
            setData,
            provisionRepositoryId,
            currentRegion,
            provisionEsclationDisplay,
            cloudTypes,
            provisionCloudType,
            logOutputTypes,
            verbosityTypes,
            dialogs
          ),
        },
      ],
    },
  ];

  return { fields };
};

export default createSchema;
