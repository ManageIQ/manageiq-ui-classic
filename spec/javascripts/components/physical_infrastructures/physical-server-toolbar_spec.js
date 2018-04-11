describe('physical-server-toolbar', function() {

  describe('physicalServerToolbar on show page', function () {

    beforeEach(function() {
      ManageIQ.record.recordId = 1;
      jasmine.spyOnFetch();
      jasmine.sendToolbarAction('power_on', 'physical_servers');
    });

    it('calls API.post with the appropriate URL', function () {
      expect(window.fetch).toHaveBeenCalledWith(
        '/api/physical_servers',
        { method: 'POST', body: '{"action":"power_on","resources":[{"id":1}]}' }
      );
    });
  });

  describe('physicalServerToolbar on show list page', function () {

    beforeEach(function () {
      ManageIQ.gridChecks = [1,2];
      jasmine.spyOnFetch();
      jasmine.sendToolbarAction('blink_loc_led', 'physical_servers');
    });

    it('calls API.post with the appropriate URL', function () {
      expect(window.fetch).toHaveBeenCalledWith(
        '/api/physical_servers',
        { method: 'POST', body: '{"action":"blink_loc_led","resources":[{"id":1},{"id":2}]}' }
      );
    });
  });
});
