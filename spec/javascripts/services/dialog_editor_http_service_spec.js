describe('dialogEditorHttp', function() {
  var testDialogEditorHttp, API;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(DialogEditorHttp, _API_) {
    testDialogEditorHttp = DialogEditorHttp;
    API = _API_;

    var responseResult = {result: 'the results'};

    spyOn(API, 'get').and.callFake(function() {
      return {then: function(response) { response(responseResult); }};
    });
  }));

  describe('#loadCategories', function() {
    it('calls the API and requests various attributes', function() {
      testDialogEditorHttp.loadCategories();
      expect(API.get).toHaveBeenCalledWith('/api/categories' +
                                                '?expand=resources' +
                                                '&attributes=id,name,description,single_value,children');
    });

    it('returns the result', function(done) {
      var loadedCategories = testDialogEditorHttp.loadCategories();

      loadedCategories.then(function(value) {
        expect(value).toEqual({result: 'the results'});
        done();
      });
    });
  });
});
