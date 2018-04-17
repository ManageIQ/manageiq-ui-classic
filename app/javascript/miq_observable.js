import { Subject } from "rxjs/Subject";

export const rxSubject = new Subject();

export const sendDataWithRx = (data) => rxSubject.next(data);
export const listenToRx = (callback) => rxSubject.subscribe(callback);

function callMapperFunction(eventMapper, event) {
  return Object.prototype.hasOwnProperty.call(eventMapper, event.type)
    && eventMapper[event.type](event.payload);
}

export function subscribeToRx(eventMapper, controllerName) {
  listenToRx(event => event.type && event.controller === controllerName && callMapperFunction(eventMapper, event));
}

/**
 * Event types are stored here.
 */
export const DELETE_EVENT = 'delete'; // Reacts to event - {type: 'delete', payload: {...}}
