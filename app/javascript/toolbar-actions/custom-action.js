import { API } from '../http_api';

export function customActionFunction(payload, resources) {
  throw new Error(`customAction ${payload.action} not yet implemented!`, payload, resources);
}

export function APIFunction(actionType, entity, resources) {
  return API.post(`/api/${entity}`, {
    action: actionType,
    resources,
  })
    .then((data) => {
      if (data.results && data.results.length > 1) {
        add_flash(sprintf(__('Requested %s of selected items.'), actionType), 'success');
      } else {
        add_flash(sprintf(__('Requested %s of selected item.'), actionType), 'success');
      }

      if (data.results){
        data.results.forEach(res => {
          if (!res.success) {
            add_flash(sprintf(__(res.message)), 'error');
          }
        });
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
