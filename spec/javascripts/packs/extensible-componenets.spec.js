describe('Extensible components', function() {
  var cmp;
  var mockApi = {
    onSomeAction: jasmine.createSpy('onSomeAction', function() {}),
    onSomeActionWithParams: jasmine.createSpy('onSomeActionWithParams', function(param) {}),
  };

  var mockRender = {
    addButtonHtml: jasmine.createSpy('addButtonHtml', function(htmlElem) {})
  };

  it('should be defined with empty items', function() {
    expect(ManageIQ.extensions).toBeDefined();
    expect(ManageIQ.extensions.items.size).toBe(0);
  });

  it('should create one item', function() {
    cmp = ManageIQ.extensions.addComponent('testCmp', mockApi, mockRender);
    expect(ManageIQ.extensions.items.size).toBe(1);
  });

  it('should remove newly created item', function() {
    cmp.delete();
    expect(ManageIQ.extensions.items.size).toBe(0);
  });

  describe('default actions', function() {
    var subscription;
    var someParam = 'something';

    beforeEach(function() {
      cmp = ManageIQ.extensions.addComponent('testCmp', mockApi, mockRender);
    });

    describe('subscription', function() {
      it('should subscribe based on name', function() {
        subscription = ManageIQ.extensions.subscribe('testCmp');
        expect(subscription.delete).toBeDefined();
        expect(subscription.with).toBeDefined();
      });

      it('should react to API', function() {
        subscription.with(function(component) {
          component.api.onSomeAction();
          component.api.onSomeActionWithParams(someParam);
        });
        expect(mockApi.onSomeAction).toHaveBeenCalled();
        expect(mockApi.onSomeActionWithParams).toHaveBeenCalledWith(someParam);
      });

      it('should react to render', function() {
        var someHTML = '<div>something</div>';
        subscription.with(function(component) {
          component.render.addButtonHtml(someHTML);
        });
        expect(mockRender.addButtonHtml).toHaveBeenCalledWith(someHTML);
      });
    });

    it('should not subscribe', function() {
      subscription = ManageIQ.extensions.subscribe('somethingBad');
      subscription.with(function(component) {
        //callback should not be called!
        expect(false).toBe(true);
      });
      expect(subscription.with).toBeDefined();
      expect(subscription.delete).toBeDefined();
    });

    afterEach(function() {
      cmp.delete();
      subscription && subscription.delete();
    });
  });
});
