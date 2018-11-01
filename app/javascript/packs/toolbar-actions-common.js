import { onDelete } from '../toolbar-actions/delete';
import { onCustomAction } from '../toolbar-actions/custom-action';

function transformResource(resource) {
  return ({ id: resource });
}

export default function getGridChecks() {
  if (ManageIQ.gridChecks.length === 0) {
    return [ManageIQ.record.recordId].map(transformResource);
  }
  return ManageIQ.gridChecks.map(transformResource);
}

function callMapperFunction(eventMapper, event) {
  return Object.prototype.hasOwnProperty.call(eventMapper, event.type)
    && eventMapper[event.type](event.payload);
}

function subscribeToRx(eventMapper, controllerName) {
  listenToRx((event) => {
    if (!event.type) {
      return undefined;
    }

    if (event.controller !== controllerName) {
      return undefined;
    }

    return callMapperFunction(eventMapper, event);
  });
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
  delete: data => onDelete(data, getGridChecks()),
  generic: data => onCustomAction(data, getGridChecks()),
};

subscribeToRx(eventMapper, 'toolbarActions');
