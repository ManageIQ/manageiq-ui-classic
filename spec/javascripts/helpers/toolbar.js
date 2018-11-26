jasmine.sendToolbarAPIAction = function(action, entity) {
  sendDataWithRx({
    type: 'generic',
    controller: 'toolbarActions',
    payload: {
      entity: entity,
      action: action,
    },
  });
}
