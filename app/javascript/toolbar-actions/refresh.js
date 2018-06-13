import { REFRESH_EVENT } from '../miq_observable';

const API = angular.injector(['ng', 'miq.api']).get('API');
const API_ENDPOINT = 'api';
const add_flash = window.add_flash;

export function showMessage(message, success) {
  if (typeof message === 'string') {
    add_flash(message, success ? 'success' : 'error');
  } else if (success) {
    add_flash(sprintf(__('Refresh of selected items queued.'), 'success'));
  } else {
    add_flash(sprintf(__('Failed to refresh selected items.'), 'error'));
  }
}

export function APIRefresh(entity, resources) {
  resources.forEach((resource) => {
    var id = resource.id;
    API.post(`/${API_ENDPOINT}/${entity}/${id}`, { action: REFRESH_EVENT })
      .then((data) => {
        showMessage(data.message, data.success);
      });
  });
}

export function onRefresh(data, resources) {
  if (data.customAction) {
    customActionDelete(data, resources);
  } else {
    APIRefresh(data.entity, resources);
  }
}
