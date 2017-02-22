describe('miq-button', function() {
  describe('without enable/disable title', function() {
    var $scope, element;
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function($compile, $rootScope) {
      $scope = $rootScope;
      $scope.miqButtonClicked = function(){};
      $scope.validForm = true;
      element = angular.element(
        '<form name="angularForm">' +
        '<miq-button name="MiqButton" title="MiqButton" alt="MiqButton" on-click="miqButtonClicked()" primary="true" enabled="validForm"></miq-button>' +
        '</form>'
      );
      element = $compile(element)($scope);
      $scope.$digest();
    }));

    it('should set button attributes and classes correctly', function(done) {
      setTimeout(function(){
        var button = element.find("miq-button > button");
        expect(button.length).not.toBe(0);
        expect(button).toHaveClass('btn');
        expect(button).toHaveClass('btn-primary');
        expect(button).not.toHaveAttr('title');
        expect(button).not.toHaveAttr('alt');
        done();
      });
    });
    it('should disable button if form is invalid', function(done) {
      $scope.validForm = false;
      $scope.$digest();
      setTimeout(function(){
        var button = element.find("miq-button > button");
        spyOn($scope, 'miqButtonClicked');
        expect(button).toHaveClass('disabled');
        button.trigger("click");
        expect($scope.miqButtonClicked).not.toHaveBeenCalled();
        done();
      });
    });

    it('should call onClick function if button is clicked and enabled', function(done) {
      $scope.validForm = true;
      $scope.$digest();
      setTimeout(function(){
        var button = element.find("miq-button > button");
        spyOn($scope, 'miqButtonClicked');
        button.trigger("click");
        expect($scope.miqButtonClicked).toHaveBeenCalled();
        done();
      });
    });

    it('should be able to enable/disable button as needed', function(done) {
      setTimeout(function(){
        var button = element.find("miq-button > button");
        spyOn($scope, 'miqButtonClicked');
        angular.forEach([true, false, true, false], function(item) {
          $scope.validForm = item;
          $scope.$digest();
          $scope.miqButtonClicked.calls.reset();
          button.trigger("click");
          if (item) {
            expect($scope.miqButtonClicked).toHaveBeenCalled();
          }
          else {
            expect($scope.miqButtonClicked).not.toHaveBeenCalled();
          }
        });
        done();
      });
    });
  });

  describe('with enable/disable title', function () {
    var $scope, element;
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function($compile, $rootScope) {
      $scope = $rootScope;
      $scope.miqButtonClicked = function(){};
      $scope.validForm = false;
      element = angular.element(
        '<form name="angularForm">' +
        '<miq-button name="MiqButton" disabled-title="Disabled MiqButton" enabled-title="Enabled MiqButton" on-click="miqButtonClicked()" primary="true" enabled="validForm"></miq-button>' +
        '</form>'
      );
      element = $compile(element)($scope);
      $scope.$digest();
    }));
    it('should set button attributes and classes correctly', function(done) {
      setTimeout(function(){
        var button = element.find("miq-button > button");
        expect(button.length).not.toBe(0);
        expect(button).toHaveClass('btn');
        expect(button).toHaveClass('btn-primary');
        expect(button.attr("title")).toBe("Disabled MiqButton");
        expect(button.attr("alt")).toBe("Disabled MiqButton");
        done();
      });
    });
  });
});
