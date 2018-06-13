import { RESTART_EVENT } from '../miq_observable';

const API = angular.injector(['ng', 'miq.api']).get('API');
const API_ENDPOINT = 'api';
const add_flash = window.add_flash;

export function showMessage(messages, success) {
  if (typeof messages === 'string') {
    add_flash(messages, success ? 'success' : 'error');
  } else {
    Object.keys(messages).forEach((msgStatus) => {
      const statusKey = msgStatus === 'true';
      if (statusKey && messages[statusKey] > 0) {
        add_flash(sprintf(__('Restarting of %s items queued.'), messages[statusKey]), 'success');
      } else if (messages[statusKey] > 0) {
        add_flash(sprintf(__('Failed to restart %s items.'), messages[statusKey]), 'error');
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

export function APIRestart(entity, resources) {
  API.post(`/${API_ENDPOINT}/${entity}`, {
    action: RESTART_EVENT,
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

export function customActionRestart(_data, _resources) {
  throw new Error('customURLRestart not implemented yet');
}

export function onRestart(data, resources) {
  if (data.customAction) {
    customActionRestart(data, resources);
  } else {
    APIRestart(data.entity, resources);
  }
}
