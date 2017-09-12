describe('verify-button', function() {
  describe('render verify button', function() {
    var $scope;
    var element;
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function($compile, $rootScope) {
      $scope = $rootScope;
      $scope.vm = {};
      Promise.resolve($.get('/static/verify-button.html.haml'))
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
        expect(element.is('miq-button'));
        done();
      });
    });
  });
});
