jasmine.createEmptyPromise = function() {
  return new Promise(function() {})
};

jasmine.spyOnFetch = function() {
  spyOn(window, 'fetch').and.callFake(function() {
    return jasmine.createEmptyPromise();
  });
};

jasmine.sendToolbarAPIAction = function(action, entity) {
  sendDataWithRx({
    type: 'generic',
    controller: 'toolbarActions',
    payload: {
      entity: entity,
      action: action
    },
  });
}
