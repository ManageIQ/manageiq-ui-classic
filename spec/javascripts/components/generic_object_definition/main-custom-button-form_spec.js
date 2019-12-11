describe('main-custom-button-form', function() {
  var $componentController, vm, miqService, API, $scope;
  beforeEach(module('ManageIQ'));
  beforeEach(inject(function (_$componentController_, _API_, _$httpBackend_, _miqService_, $rootScope, $q) {
    $componentController = _$componentController_;
    API = _API_;
    miqService = _miqService_;
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;

    var bindings = {genericObjectDefinitionRecordId: '1', customButtonGroupRecordId: '2', customButtonRecordId: '3', redirectUrl: '/redirect/url'};
    vm = $componentController("mainCustomButtonForm", null, bindings);
    var deferred = $q.defer();
    spyOn(API, 'get').and.callFake(function() {return deferred.promise;});
    var domainsResponse = {
      data:{
        distinct_instances_across_domains: ["Automation", "Event", "GenericObject", "MiqEvent", "Request", "parse_automation_request", "parse_event_stream", "parse_provider_category"]
      }
    };
    var serviceTemplatesResponse = {
      data: {
        templates: [{name: "Ansible Catalog Item", id: 0}],
      }
    };
    $httpBackend.whenGET('/generic_object_definition/retrieve_distinct_instances_across_domains').respond(domainsResponse);
    $httpBackend.whenGET('/generic_object_definition/service_template_ansible_playbooks').respond(serviceTemplatesResponse);
    vm.$onInit();
    $httpBackend.flush();
  }));

  describe('#saveClick', function() {
    beforeEach(function(){
      spyOn(window, 'add_flash');
    });

    it('catch 400 and call add_flash if error is name/description taken', function(done) {
      var rejectionData = {status: 400, data: {error: {message: "Name has already been taken, Description has already been taken"}}};
      spyOn(API, 'put').and.returnValue(Promise.reject(rejectionData));
      vm.saveClicked()
        .then( function() {
          expect(add_flash).toHaveBeenCalledWith("Name has already been taken", "error");
          expect(add_flash).toHaveBeenCalledWith("Description has already been taken", "error");
          done();
        })
        .catch(function() {
          expect(add_flash).toHaveBeenCalledWith("Name has already been taken", "error");
          expect(add_flash).toHaveBeenCalledWith("Description has already been taken", "error");

          done();
        });
    });
  });

  describe('#addClick', function() {
    beforeEach(function(){
      spyOn(window, 'add_flash');
      spyOn(miqService, 'handleFailure').and.callFake(function() {debugger;return Promise.reject()});
    });

    it('catch 400 and call add_flash', function(done) {
      var rejectionData = {status: 400, data: {error: {message: "Name has already been taken, Description has already been taken"}}};
      spyOn(API, 'post').and.returnValue(Promise.reject(rejectionData));
      vm.addClicked()
        .then( function() {
          expect(add_flash).toHaveBeenCalledWith("Name has already been taken", "error");
          expect(add_flash).toHaveBeenCalledWith("Description has already been taken", "error");
          expect(vm.customButtonModel.resource_action.ae_attributes).toHaveAttr('service_template');
          done();
      })
        .catch(function () {
          expect(add_flash).toHaveBeenCalledWith("Name has already been taken", "error");
          expect(add_flash).toHaveBeenCalledWith("Description has already been taken", "error");
          done();
        });
    });
  });
});
