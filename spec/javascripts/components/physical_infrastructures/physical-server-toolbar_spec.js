describe('physical-server-toolbar', function() {
  var sendToolbarAPIAction = function(action, entity) {
    sendDataWithRx({
      type: 'generic',
      controller: 'toolbarActions',
      payload: {
        entity: entity,
        action: action
      },
    });
  };

  describe('physicalServerToolbar on show page', function () {

    beforeEach(function() {
      ManageIQ.record.recordId = 1;
      spyOn(API, 'post').and.callFake(function() {
        return new Promise(function() {})
      });

      sendToolbarAPIAction('power_on', 'physical_servers');
    });

    it('calls API.post with the appropriate URL', function () {
      expect(API.post).toHaveBeenCalledWith('/api/physical_servers', {
        action: "power_on",
        resources: [{ id: 1 }],
      });
    });

    afterEach(function() {
      ManageIQ.record.recordId = null;
    });
  });

  describe('physicalServerToolbar on show list page', function () {

    beforeEach(function () {
      ManageIQ.gridChecks = [1,2];
      spyOn(API, 'post').and.callFake(function() {
        return new Promise(function() {})
      });

      sendToolbarAPIAction('blink_loc_led', 'physical_servers');
    });

    it('calls API.post with the appropriate URL', function () {
      expect(API.post).toHaveBeenCalledWith('/api/physical_servers', {
        action: "blink_loc_led",
        resources: [{ id: 1 }, { id: 2 }],
      });
    });

    afterEach(function() {
      ManageIQ.gridChecks = null;
    });
  });
});
