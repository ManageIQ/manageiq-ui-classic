export function customActionFunction(payload, resources) {
  throw new Error(`customAction ${payload.action} not yet implemented!`, payload, resources);
}

export function APIFunction(actionType, entity, resources) {
  const API = angular.injector(['ng', 'miq.api']).get('API');
  const API_ENDPOINT = 'api';

  return API.post(`/${API_ENDPOINT}/${entity}`, {
    action: actionType,
    resources,
  })
    .then((data) => {
      if (data.results && data.results.length > 1) {
        add_flash(sprintf(__('Requested %s of selected items.'), actionType), 'success');
      } else {
        add_flash(sprintf(__('Requested %s of selected item.'), actionType), 'success');
      }
      return data;
    })
    .catch(data => data);
}

export function onCustomAction(payload, resources) {
  if (payload.customAction) {
    return customActionFunction(payload, resources);
  }
  return APIFunction(payload.action, payload.entity, resources);
}
