describe('verify-button', function() {
  describe('render verify button', function() {
    var $scope;
    var compile;
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function($compile, $rootScope) {
      $scope = $rootScope;
      $scope.vm = {};
      compile = $compile;
    }));

    it('renders miq-button', function(done) {
      Promise.resolve($.get('/static/verify-button.html.haml'))
        .then(function(data) {
          var element = angular.element(data);
          element = compile(element)($scope);
          expect(element.is('miq-button')).toBe(true);
        }).catch(function() {
          expect('Error').toEqual(null);
        }).then(done);
    });
  });
});
