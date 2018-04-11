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
export const DELETE_EVENT = 'delete';
export const CUSTOM_TOOLBAR_ACTIONS = {
  REFRESH_EVENT: 'refresh',
  POWER_ON_EVENT: 'power_on',
  POWER_OFF_EVENT: 'power_off',
  POWER_OFF_NOW_EVENT: 'power_off_now',
  RESTART_EVENT: 'restart',
  RESTART_NOW_EVENT: 'restart_now',
  RESTART_TO_SYS_STUP_EVENT: 'restart_to_sys_setup',
  RESTART_MGMT_CONTROLLER_EVENT: 'restart_mgmt_controller',
  BLINK_LOC_LED_EVENT: 'blink_loc_led',
  TURN_ON_LOC_LED_EVENT: 'turn_on_loc_led',
  TURN_OFF_LOC_LED_EVENT: 'turn_off_loc_led',
};
