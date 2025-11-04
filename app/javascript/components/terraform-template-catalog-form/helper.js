import { useFieldApi, useFormApi } from '@@ddf';
import React from 'react';
import { Checkbox } from 'carbon-components-react';
import PropTypes from 'prop-types';
import { TreeViewRedux } from '../tree-view';

/** Helper function to convert object into array used for extra vars restructuring */
const convertObject = (inputObj) => {
  const outputArray = Object.entries(inputObj).map(([key, value]) => ({ key, value: value.default }));
  return outputArray;
};

/** Helper function used for restructuring extra vars */
const refactorExtraVars = (catalogData) => {
  if (Object.prototype.hasOwnProperty.call(catalogData.config_info.provision, 'extra_vars')) {
    catalogData.config_info.provision.extra_vars = convertObject(catalogData.config_info.provision.extra_vars);
  }
  //   if (Object.prototype.hasOwnProperty.call(catalogData.config_info.retirement, 'extra_vars')) {
  //     catalogData.config_info.retirement.extra_vars = convertObject(catalogData.config_info.retirement.extra_vars);
  //   }
  return catalogData;
};

/** Helper function to convert array into object used for extra vars restructuring */
const convertArrayToObject = (arr) => arr.reduce((acc, curr) => {
  acc[curr.key] = { default: curr.value };
  return acc;
}, {});

/** get tenantId from key */
const getTenantId = (key) => {
  if (key.startsWith('tn')) {
    return key.split('-')[1];
  }
  return undefined;
};

const getSortedHash = (inputHash) => {
  const sortedHash = Object.keys(inputHash)
    .map((key) => ({ k: key, v: inputHash[key] }))
    .sort((a, b) => a.v.localeCompare(b.v))
    .reduce((o, e) => {
      o[e.k] = e.v;
      return o;
    }, {});
  return sortedHash;
};

/** Helper function to get various log types */
export const getLogOutputTypes = () => ({
  on_error: __('On Error'),
  always: __('Always'),
  never: __('Never'),
});

/** Helper function to get various verbose types */
export const getVerbosityTypes = () => ({
  0: '0 (Normal)',
  1: '1 (Verbose)',
  2: '2 (More Verbose)',
  3: '3 (Debug)',
  4: '4 (Connection Debug)',
  5: '5 (WinRM Debug)',
});

/** Helper function to get list of cloud types */
export const formCloudTypes = (data) => {
  const cloudTypes = {};
  const embeddedTerraformCredentialTypes = data.data.credential_types.embedded_terraform_credential_types;

  Object.keys(embeddedTerraformCredentialTypes).forEach((credType) => {
    const credObject = embeddedTerraformCredentialTypes[credType];
    if (credObject.type === 'cloud') {
      cloudTypes[credType] = credObject.label;
    }
  });
  return getSortedHash(cloudTypes);
};

/** Helper function to append tenant in front of catalog name */
const formOptsCatalogTenants = (catalogs) => catalogs.map((catalog) => ({
  name: catalog[0],
  id: catalog[1].toString(),
}));

/** edit the name of each catalog to get all tenant ancestors in the name if they exist */
export const restructureAvailableCatalogs = (availableCatalogs, allCatalogs) => {
  const availableCatalogsAfterRestructure = availableCatalogs.map((catalog) => ({
    ...catalog,
    name: _.find(formOptsCatalogTenants(allCatalogs), { id: catalog.id }).name,
  }));
  return availableCatalogsAfterRestructure;
};

/** button component used as a mapper to copy the provision details into retirement */
// export const CopyFromProvisonButton = (props) => {
//   const { label, copyFrom, copyTo } = useFieldApi(props);
//   const formOptions = useFormApi();
//   const handleClick = () => {
//     copyFrom.forEach((fromItem, i) => {
//       const destination = `config_info.retirement.${copyTo[i]}`;
//       formOptions.change(destination, formOptions.getState().values.config_info.provision[fromItem]);
//     });
//   };
//   return (
//     <div>
//       <Button kind="secondary" onClick={handleClick}>{label}</Button>
//     </div>
//   );
// };

/** conditional checkbox mapper component to render escalation privilege field */
export const conditionalCheckbox = (props) => {
  const {
    input, label, id, display,
  } = useFieldApi(props);
  const formOptions = useFormApi();
  const isChecked = (!!input.value);
  const onChange = (_evt) => {
    formOptions.change(input.name, !input.value);
  };
  if (display) {
    return (
      <Checkbox
        id={id}
        name={id}
        labelText={label}
        checked={isChecked}
        onChange={onChange}
      />
    );
  }
  return <></>;
};

/** wrapper component to show the tenants tree structure */
export const TreeViewReduxWrapper = (props) => {
  const propsData = useFieldApi(props);
  // eslint-disable-next-line react/destructuring-assignment
  if (props.roleAllows) {
    return (
      <div>
        <label htmlFor={propsData.input.name} className="bx--label">{propsData.label}</label>
        <br />
        <TreeViewRedux {...propsData} />
      </div>
    );
  }
  return (<></>);
};

TreeViewReduxWrapper.propTypes = {
  roleAllows: PropTypes.bool.isRequired,
};

/** Helper function to prepare the request object for both edit and create */
export const prepareRequestObject = (values, formId) => {
  const requestObject = { ...values };

  // if price property is not there add price property if its present convert the value into string
  if (!Object.prototype.hasOwnProperty.call(requestObject, 'price')) {
    requestObject.price = '';
  } else {
    requestObject.price = requestObject.price != null ? requestObject.price.toString() : '';
  }

  // add currency_id field if its not empty and also make the price as "" when currency_id field is not present
  if (!Object.prototype.hasOwnProperty.call(requestObject, 'currency_id')) {
    requestObject.currency_id = '';
    requestObject.price = '';
  }

  // adding addition_tennant_ids after fetching from tree redux
  // eslint-disable-next-line no-undef
  const newIds = miqGetSelectedKeys(ManageIQ.redux.store.getState().tenants_tree).map(getTenantId);
  if (newIds) {
    requestObject.additional_tenant_ids = newIds.sort();
  }

  // restructuring the extra_vars to convert it from array to object with key value pairs
  if (requestObject.config_info.provision.extra_vars) {
    requestObject.config_info.provision.extra_vars = convertArrayToObject(requestObject.config_info.provision.extra_vars);
  }

  //   if (requestObject.config_info.retirement.extra_vars) {
  //     requestObject.config_info.retirement.extra_vars = convertArrayToObject(requestObject.config_info.retirement.extra_vars);
  //   }

  // delete the dialog_id_type field
  delete requestObject.config_info.provision.dialog_type;

  // delete cloud_type field for both provision and retirement
  delete requestObject.config_info.provision.cloud_type;
  //   delete requestObject.config_info.retirement.cloud_type;

  // refactor the remove_resources filed
  //   if (!Object.prototype.hasOwnProperty.call(requestObject.config_info.retirement, 'repository_id')) {
  //     requestObject.config_info.retirement.remove_resources = requestObject.config_info.retirement.remove_resources_with_no_repistory_id;
  //     delete requestObject.config_info.retirement.remove_resources_with_no_repistory_id;
  //   }

  if (formId === 'new') {
    return { ...requestObject, type: 'ServiceTemplateTerraformTemplate', prov_type: 'generic_terraform_template' };
  }

  return requestObject;
};

/** Helper function to prepare the restructure data to show fields in DDF form */
export const restructureCatalogData = function(catalogData, provisionCloudType) {
  let restructuredCatalogData = { ...catalogData };

  // adding dialog_type field for provision data
  if (Object.prototype.hasOwnProperty.call(restructuredCatalogData.config_info.provision, 'dialog_id')) {
    restructuredCatalogData.config_info.provision.dialog_type = 'useExisting';
  }

  // adding cloud_type field for both provision and retirement
  restructuredCatalogData.config_info.provision.cloud_type = provisionCloudType;
  //   restructuredCatalogData.config_info.retirement.cloud_type = retirementCloudType;

  // refactor the extra vars field for provision and retirement
  restructuredCatalogData = refactorExtraVars(restructuredCatalogData);

  // add config_info.retirement.remove_resources_with_no_repistory_id if repiostry_id is empty
  // also copy the config_info.retirement.remove_resources into the newly added field of above
  //   if (!Object.prototype.hasOwnProperty.call(restructuredCatalogData.config_info.retirement, 'repository_id')) {
  //     // eslint-disable-next-line max-len
  //     restructuredCatalogData.config_info.retirement.remove_resources_with_no_repistory_id = restructuredCatalogData.config_info.retirement.remove_resources;
  //     restructuredCatalogData.config_info.retirement.remove_resources = 'no_with_playbook';
  //   } else {
  //     restructuredCatalogData.config_info.retirement.remove_resources_with_no_repistory_id = 'no_without_playbook';
  //   }

  return restructuredCatalogData;
};

/** Helper function to prepare the data to show fields in DDF form for create */
export const formCatalogData = () => {
  const catalogData = {
    name: '',
    description: '',
    service_template_id: '',
    display: false,
    service_template_catalog_id: '',
    long_description: '',
    zone_id: '',
    currency_id: '',
    price: '',
    config_info: {
      provision: {
        repository_id: '',
        verbosity: '0',
        log_output: 'on_error',
        extra_vars: [],
        execution_ttl: '',
        become_enabled: false,
        dialog_id: '',
        specify_host_type: 'localhost',
        dialog_type: 'useExisting',
      },
    //   retirement: {
    //     remove_resources: 'no_with_playbook',
    //     verbosity: '0',
    //     log_output: 'on_error',
    //     cloud_type: '',
    //     remove_resources_with_no_repistory_id: 'yes_without_playbook',
    //     specify_host_type: 'localhost',
    //   },
    },
  };

  return catalogData;
};
