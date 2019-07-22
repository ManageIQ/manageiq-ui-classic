describe('repositoryFormController', function() {
  var $scope, API, miqService, $controller;
  var repository = {
    name: 'Repository',
    description: 'Test repository',
    scm_url: 'https://github.com/ManageIQ',
    authentication_id: null,
    scm_branch: 'master',
  };
  var newRepository = {
    name: '',
    description: '',
    scm_url: '',
    authentication_id: null,
    scm_branch: '',
  };

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_API_, $rootScope, _$controller_, _miqService_) {

    API = _API_;
    miqService = _miqService_;
    $scope = $rootScope.$new();
    $controller = _$controller_;

    $scope.vm = {};
    $scope.vm.repositoryModel = newRepository;

    spyOn(API, 'get').and.callFake(function(url){
      var response = {};
      if (url === '/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ScmCredential&expand=resources&sort_by=name&sort_order=ascending') {
        response = {results: [{name: 'SCM credential', value: 12345}]};
      } else if (url === '/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager') {
        response = {results: [{href: 'https://example.com'}]};
      } else if (url.startsWith('/api/configuration_script_sources/')) {
        response = repository;
      }
      return Promise.resolve(response);
    });
    spyOn(API, 'put').and.callFake(function(){
      var response = {success: false, message: 'karel'};
      return Promise.resolve(response);
    });
    spyOn(API, 'post').and.callFake(function(){
      var response = {success: false, message: 'karel'};
      return Promise.resolve(response);
    });
  }));


  describe('when repositoryId is new', function() {
    beforeEach(function () {
      $controller('repositoryFormController as vm', {
        $scope: $scope,
        repositoryId: 'new',
        miqService: miqService,
        API: API
      });
    });
    it('sets repositoryModel correctly', function (done) {
      setTimeout(function() {
        expect($scope.vm.repositoryModel).toEqual(newRepository);
        done();
      });
    });
  });

  describe('when repositoryId is a number', function() {
    beforeEach(function() {
      $controller('repositoryFormController as vm', {
        $scope: $scope,
        repositoryId: 12345,
        miqService: miqService,
        API: API
      });
    });
    it('sets repositoryModel correctly', function (done) {
      setTimeout(function() {
        expect($scope.vm.repositoryModel).toEqual(jasmine.objectContaining(repository));
        done();
      });
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){},
        $setUntouched: function (value){},
      };
      $controller('repositoryFormController as vm', {
        $scope: $scope,
        repositoryId: 'new',
        miqService: miqService,
        API: API
      });
      $scope.vm.modelCopy = angular.copy($scope.vm.repositoryModel); //set modelCopy to default value
      $scope.vm.repositoryModel.description = 'value changed'; //values changed
      $scope.vm.resetClicked($scope.angularForm);
    });

    it('sets values to original', function(done) {
      setTimeout(function() {
        expect($scope.vm.repositoryModel).toEqual(newRepository);
        done();
      });
    });
  });

  describe('#saveClicked', function() {
    var controller;
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      controller = $controller('repositoryFormController as vm', {
        $scope: $scope,
        repositoryId: 12345,
        miqService: miqService,
        API: API
      });
      spyOn(controller, 'getBack').and.callFake(function(){ return true;});

      $scope.vm.saveClicked();
    });

    it('calls API', function(done) {
      setTimeout(function() {
        expect(API.put).toHaveBeenCalledWith('/api/configuration_script_sources/12345', $scope.vm.repositoryModel);
        done();
      });
    });
  });
});
