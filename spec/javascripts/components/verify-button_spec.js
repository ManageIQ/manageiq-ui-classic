describe('verify-button', function() {
  describe('render verify button', function() {
    var $scope;
    var element;
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function($compile, $rootScope) {
      $scope = $rootScope;
      $scope.vm = {};
      Promise.resolve($.get('/static/verify_button.html.haml'))
      .then(function(data) {
        element = angular.element(data);
      }).catch(function() {
        expect('Error').toEqual(null);
      });
      element = $compile(element)($scope);
      $scope.$digest();
    }));
    it('renders miq-button', function(done) {
      setTimeout(function() {
        var miqButton = element.find('miq-button');
        expect(miqButton.length).not.toBe(0);
        done();
      });
    });
  });
});
