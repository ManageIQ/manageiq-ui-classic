import { subscribeToRx, DELETE_EVENT, CUSTOM_TOOLBAR_ACTIONS } from '../miq_observable';

import { onDelete } from '../toolbar-actions/delete';
import { onCustomAction } from '../toolbar-actions/custom-action';

function transformResource(resource) {
  return ({ id: resource });
}

function eventNamesToCustomAction(eventNames) {
  return eventNames.reduce((acc, eventName) => {
    acc[eventName] = (data) => onCustomAction(eventName, data, getGridChecks());
    return acc;
  }, {});
}

export function getGridChecks() {
  if (ManageIQ.gridChecks.length === 0) {
    return [ManageIQ.record.recordId].map(transformResource);
  }
  return ManageIQ.gridChecks.map(transformResource);
}

/**
 * Function event mapper for observed RX subject.
 * For action:
 *     {type: 'example', payload: {...}}
 * You need to add:
 *     example: (data) => exampleFunction(data)
 * Where exampleFunction is you function which is triggered whenever new action is dispatched
 * to RX with type 'example'.
 */
const eventMapper = {
  [DELETE_EVENT]: data => onDelete(data, getGridChecks()),
  ...eventNamesToCustomAction(Object.values(CUSTOM_TOOLBAR_ACTIONS)),
};

subscribeToRx(eventMapper, 'toolbarActions');
