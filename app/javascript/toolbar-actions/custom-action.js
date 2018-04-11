export function customActionFunction(actionType, payload, resources) {
  throw new Error(`customAction ${actionType} not yet implemented!`, payload, resources);
}

export function APIFunction(actionType, entity, resources) {
  const API = angular.injector(['ng', 'miq.api']).get('API');
  const API_ENDPOINT = 'api';

  return API.post(`/${API_ENDPOINT}/${entity}`, {
    action: actionType,
    resources,
  })
    .then(data => {
      if (data.results && data.results.length > 1) {
        add_flash(sprintf(__(`Requested ${actionType} of selected items.`)), 'success');
      } else {
        add_flash(sprintf(__(`Requested ${actionType} of selected item.`)), 'success');
      }
      return data;
    })
    .catch(data => data);
}

export function onCustomAction(actionType, payload, resources) {
  if (payload.customAction) {
    customActionFunction(actionType, payload, resources);
  } else {
    APIFunction(actionType, payload.entity, resources);
  }
}
