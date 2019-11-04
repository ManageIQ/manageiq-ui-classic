describe('dialogFieldRefreshService', function() {
  var testDialogFieldRefreshService, API;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(dialogFieldRefreshService, _API_, DialogData) {
    testDialogFieldRefreshService = dialogFieldRefreshService;
    API = _API_;

    var responseResult = {
      result: {
        'the field': 'the results'
      }
    };

    spyOn(API, 'post').and.callFake(function() {
      return Promise.resolve(responseResult);
    });

    DialogData.data = {
      fields: {},
    };
  }));

  describe('#refreshField', function() {
    var data = { "the field": "data1" };
    var field = 'the field';
    var url = 'url';
    var idList = {
      dialogId: '123',
      resourceActionId: '321',
      targetId: '456',
      targetType: 'service_template',
    };

    var refreshPromise;
    var resolvedValue;

    beforeEach(function(done) {
      refreshPromise = testDialogFieldRefreshService.refreshField(data, field, url, idList);

      refreshPromise.then(function(value) {
        resolvedValue = value;
        done();
      });
    });

    it('returns a promise', function() {
      expect(refreshPromise instanceof Promise).toBe(true);
    });

    it('uses a post on the API', function() {
      var requestData = {
        action: 'refresh_dialog_fields',
        resource: {
          dialog_fields: data,
          fields: 'the field',
          resource_action_id: '321',
          target_id: '456',
          target_type: 'service_template',
        }
      };

      expect(API.post).toHaveBeenCalledWith('url123', JSON.stringify(requestData));
    });

    it('resolves the promise with the results', function() {
      expect(resolvedValue).toEqual('the results');
    });
  });
});
