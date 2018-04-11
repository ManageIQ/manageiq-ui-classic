import { subscribeToRx, DELETE_EVENT, REFRESH_EVENT, RESTART_EVENT } from '../miq_observable';
import { onDelete } from '../toolbar-actions/delete';
import { onRefresh } from '../toolbar-actions/refresh';
import { onRestart } from '../toolbar-actions/restart';

function transformResource(resource) {
  return ({ id: resource });
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
  [REFRESH_EVENT]: data => onRefresh(data, getGridChecks()),
  [RESTART_EVENT]: data => onRestart(data, getGridChecks()),
};

subscribeToRx(eventMapper, 'toolbarActions');
