import sortBy from 'lodash/sortBy';
import * as actionTypes from './actionTypes';
import { buildDropDown } from './helpers';

const mapCloudType = (cloudTypes) => {
  const credentialTypes = cloudTypes.embedded_ansible_credential_types;
  const cloudTypeList = [];
  Object.keys(credentialTypes).forEach((key) => {
    if (credentialTypes[key].type === 'cloud') {
      cloudTypeList.push({
        label: credentialTypes[key].label,
        value: key,
      });
    }
  });
  return sortBy(cloudTypeList, 'label');
};

const initialState = {
  loading: false,
  dropdowns: {},
};

export default (state = initialState, action) => {
  const dropdowns = { ...state.dropdowns };
  const updatedState = { ...state };

  switch (action.type) {
    case actionTypes.LOAD_CATALOGS:
      dropdowns.catalogs = buildDropDown(action.payload, 0, 1);
      break;
    case actionTypes.LOAD_DIALOGS:
      dropdowns.dialogs = buildDropDown(action.payload.resources, 'label', 'id');
      break;
    case actionTypes.LOAD_REPOS:
      dropdowns.repos = buildDropDown(action.payload.resources, 'name', 'id');
      break;
    case actionTypes.LOAD_PLAYBOOKS: {
      const playbookDropDown = `${action.payload.playbookType}_playbooks`;
      dropdowns[playbookDropDown] = buildDropDown(action.payload.resources, 'name', 'id');
      break;
    }
    case actionTypes.LOAD_MACHINE_CREDENTIALS:
      dropdowns.machineCredentials = buildDropDown(action.payload.resources, 'name', 'id');
      break;
    case actionTypes.LOAD_VAULT_CREDENTIALS:
      dropdowns.vaultCredentials = buildDropDown(action.payload.resources, 'name', 'id');
      break;
    case actionTypes.LOAD_CLOUD_TYPES:
      dropdowns.cloudTypes = mapCloudType(action.payload.credential_types);
      break;
    case actionTypes.LOAD_CLOUD_CREDENTIALS: {
      const { fieldType } = action.payload;
      dropdowns[`${fieldType}_cloudCredentials`] = buildDropDown(action.payload.resources, 'name', 'id');
      break;
    }
    case actionTypes.LOAD_CATALOG_ITEM:
      updatedState.catalogItem = action.payload;
      break;
    case actionTypes.LOAD_CLOUD_CREDENTIAL:
      updatedState.cloudCredential = action.payload;
      break;
    case actionTypes.DUPLICATE_DROPDOWNS:
      action.payload.forEach((field) => {
        dropdowns[`retirement_${field}`] = dropdowns[`provision_${field}`];
      });
      break;
    default:
      return updatedState;
  }
  updatedState.dropdowns = dropdowns;
  return updatedState;
};
