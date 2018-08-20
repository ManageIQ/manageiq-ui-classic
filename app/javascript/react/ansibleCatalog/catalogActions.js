import * as actionTypes from './actionTypes';
import { API } from '../../http_api';

export const commonParams = '&expand=resources&sort_by=name&sort_order=ascending';
export const credentialsRequest = type => `/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::${type}&attributes=id,name${commonParams}`;
export const catchError = (error) => {
  if (!error.data) {
    error.data = { // eslint-disable-line no-param-reassign
      error: { message: `Request failed, ${error.message}` },
    };
  }
  window.add_flash(error.data.error.message, 'error');
};
export const loadCatalogs = catalogs => ({
  type: actionTypes.LOAD_CATALOGS,
  payload: catalogs,
});
export const loadDialogs = () => dispatch => API.get('/api/service_dialogs/?expand=resources&attributes=id,label&sort_by=label&sort_order=ascending').then((data) => {
  dispatch({
    type: actionTypes.LOAD_DIALOGS,
    payload: data,
  });
}).catch((error) => {
  catchError(error);
});
export const loadRepos = region => dispatch => API.get(`/api/configuration_script_sources?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource&attributes=id,name&filter[]=region_number=${region}${commonParams}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_REPOS,
    payload: data,
  });
}).catch((error) => {
  catchError(error);
});
export const loadPlaybooks = (region, repoId, playbookType) => dispatch => API.get(`/api/configuration_script_sources/${repoId}/configuration_script_payloads?filter[]=region_number=${region}${commonParams}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_PLAYBOOKS,
    payload: { ...data, playbookType },
  });
}).catch((error) => {
  catchError(error);
});
export const loadCredentials = type => (dispatch) => {
  const actionType = (type === 'Machine' ? actionTypes.LOAD_MACHINE_CREDENTIALS : actionTypes.LOAD_VAULT_CREDENTIALS);

  return API.get(credentialsRequest(`${type}Credential`)).then((data) => {
    dispatch({
      type: actionType,
      payload: data,
    });
  }).catch((error) => {
    catchError(error);
  });
};
export const loadCloudTypes = () => dispatch => API.options('/api/authentications').then((data) => {
  dispatch({
    type: actionTypes.LOAD_CLOUD_TYPES,
    payload: data.data,
  });
}).catch((error) => {
  catchError(error);
});
export const loadCloudCredentials = (fieldType, cloudType) => dispatch => API.get(`/api/authentications?collection_class=${cloudType}&attributes=id,name${commonParams}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_CLOUD_CREDENTIALS,
    payload: { ...data, fieldType },
  });
}).catch((error) => {
  catchError(error);
});
export const loadCatalogItem = catalogItemId => dispatch => API.get(`/api/service_templates/${catalogItemId}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_CATALOG_ITEM,
    payload: data,
  });
}).catch((error) => {
  catchError(error);
});
export const loadCloudCredential = credentialId => dispatch => API.get(`/api/authentications/${credentialId}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_CLOUD_CREDENTIAL,
    payload: data,
  });
}).catch((error) => {
  catchError(error);
});
export const duplicateDropdowns = fields => ({
  type: actionTypes.DUPLICATE_DROPDOWNS,
  payload: fields,
});
