import { API } from '../http_api';

export function showMessage(messages, labels = { single: '', multiple: '' }) {
  Object.keys(messages).forEach((msgStatus) => {
    const statusKey = msgStatus === 'true';
    const label = messages[statusKey] === 1 ? labels.single : labels.multiple;

    if (statusKey && messages[statusKey] > 0) {
      add_flash(sprintf(__('Delete initiated for %s %s.'), messages[statusKey], label), 'success');
    } else if (messages[statusKey] > 0) {
      add_flash(sprintf(__('Failed to delete %s %s.'), messages[statusKey], label), 'error');
    }
  });
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

export function APIDelete(entity, resources, labels) {
  API.post(`/api/${entity}`, {
    action: 'delete',
    resources,
  }).then((data) => {
    showMessage(generateMessages(data.results), labels);
    return data;
  });
}

export function customActionDelete() {
  throw new Error('customURLDelete not implemented yet');
}

export function onDelete(data, resources) {
  if (data.customAction) {
    customActionDelete(data, resources);
  } else {
    APIDelete(data.entity, resources, data.labels);
  }
}
