import { subscribeToRx, DELETE_EVENT } from '../helpers/rxConnector';

const API = angular.injector(['ng', 'miq.api']).get("API");

export function showMessage(messages, success) {
  if (typeof messages === 'string') {
    add_flash(messages, success ? 'success' : 'error');
  } else {
    Object.keys(messages).forEach((msgStatus) => {
      const statusKey = msgStatus === 'true';
      if (statusKey && messages[statusKey] > 0) {
        add_flash(sprintf(__('Deleting of %s items queued.'), messages[statusKey]), 'success');
      } else if (messages[statusKey] > 0) {
        add_flash(sprintf(__('Failed to delete %s items.'), messages[statusKey]), 'error');
      }
    });
  }
}

export function generateMessages(results) {
  return results.reduce((messages, result) => {
    const statusMessages = Object.assign(messages);
    if (Object.prototype.hasOwnProperty.call(result, 'success')) {
      statusMessages[result.success] += 1;
    }
    return statusMessages;
  }, { false: 0, true: 0 });
}

export function APIDelete(entity, resources) {
  API.post(`/api/${entity}`, {
    action: DELETE_EVENT,
    resources,
  })
  .then((data) => {
    if (data.results.length > 1) {
      showMessage(generateMessages(data.results));
    } else if (data.results.length === 1) {
      showMessage(data.results[0].message, data.results[0].success);
    }
  });
}

export function customActionDelete(_data, _resources) {
  throw new Error('customURLDelete not implemented yet');
}

export function onDelete(data) {
  let resources;
  if (ManageIQ.gridChecks.length === 0) {
    resources = [ManageIQ.record.recordId];
  } else {
    resources = ManageIQ.gridChecks;
  }
  if (data.customAction) {
    customActionDelete(data, resources);
  } else {
    APIDelete(data.entity, resources.map(resource => ({ id: resource })));
  }
}

const eventMapper = {
  [DELETE_EVENT]: onDelete,
};

subscribeToRx(eventMapper);
