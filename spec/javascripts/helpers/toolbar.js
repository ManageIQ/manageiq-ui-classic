jasmine.createEmptyPromise = function() {
 return new Promise(function() {})
};

jasmine.spyOnFetch = function() {
  spyOn(window, 'fetch').and.callFake(function() {
    return jasmine.createEmptyPromise();
  });
};

jasmine.sendToolbarAction = function(action, entity) {
  sendDataWithRx({
    type: action,
    controller: 'toolbarActions',
    payload: {
      entity: entity
    },
  });
}
