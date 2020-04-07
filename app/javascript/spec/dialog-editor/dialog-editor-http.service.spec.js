describe('dialogEditorHttp', () => {
  let DialogEditorHttp, API;

  beforeEach(module('ManageIQ'));

  beforeEach(inject((_DialogEditorHttp_, _API_) => {
    DialogEditorHttp = _DialogEditorHttp_;
    API = _API_;

    const responseResult = { result: 'the results' };

    spyOn(API, 'get').and.callFake(() => ({
      then: (response) => response(responseResult),
    }));
  }));

  describe('#loadCategories', () => {
    it('calls the API and requests various attributes', () => {
      DialogEditorHttp.loadCategories();
      expect(API.get).toHaveBeenCalledWith('/api/categories?expand=resources&attributes=id,name,description,single_value,children');
    });

    it('returns the result', (done) => {
      const loadedCategories = DialogEditorHttp.loadCategories();

      loadedCategories.then((value) => {
        expect(value.result).toEqual('the results');
        done();
      });
    });
  });
});
