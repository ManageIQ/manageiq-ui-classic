function callMapperFunction(eventMapper, event) {
  return Object.prototype.hasOwnProperty.call(eventMapper, event.type)
    && eventMapper[event.type](event.payload);
}

export function subscribeToRx(eventMapper) {
  ManageIQ.angular
    .rxSubject
    .subscribe(event => event.type && callMapperFunction(eventMapper, event));
}

export const DELETE_EVENT = 'delete';
