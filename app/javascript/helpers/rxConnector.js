import { listenToRx } from '../miq_observable';

function callMapperFunction(eventMapper, event) {
  return Object.prototype.hasOwnProperty.call(eventMapper, event.type)
    && eventMapper[event.type](event.payload);
}

export function subscribeToRx(eventMapper) {
  listenToRx(event => event.type && callMapperFunction(eventMapper, event));
}

/**
 * Event types are stored here.
 */
export const DELETE_EVENT = 'delete'; // Reacts to event - {type: 'delete', payload: {...}}
