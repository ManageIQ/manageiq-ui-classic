describe('ansible-raw-stdout', function() {
  var scope, compile, $q;

  beforeEach(module('ManageIQ'));
  beforeEach(inject(function($compile, $rootScope, $templateCache, _$q_) {
    // FIXME: templateRequest is using $http to get the template, but angular-mocks prevents it
    $templateCache.put('/static/ansible-raw-stdout.html.haml', '<div></div>');

    $scope = $rootScope.$new();
    element = angular.element('<ansible-raw-stdout task-id="123"></ansible-raw-stdout>');

    compile = function() {
      element = $compile(element)($scope);
      $scope.$digest();
      scope = element.find('div').scope();
    };

    $q = _$q_;
  }));

  describe('on error', function() {
    beforeEach(inject(function(API) {
      spyOn(API, 'wait_for_task').and.callFake(function(url) {
        return $q.reject({
          href: "http://localhost:3000/api/tasks/10000000054710",
          id: "10000000054710",
          name: "ansible_stdout",
          state: "Finished",
          status: "Error",
          message: "Cannot get standard output of this playbook because the embedded Ansible role is not enabled",
          userid: "system",
          created_on: "2017-11-14T17:14:48Z",
          updated_on: "2017-11-14T17:14:48Z",
        });
      });

      compile();
    }));

    it('sets the data', function(done) {
      setTimeout(function() {
        expect(scope.$ctrl.error).toBeDefined();
        expect(scope.$ctrl.loading).toBeFalsy();
        expect(scope.$ctrl.data).toBeFalsy();
        done();
      });
    });
  });

  describe('on success', function() {
    beforeEach(inject(function(API) {
      spyOn(API, 'wait_for_task').and.callFake(function(url) {
        return $q.resolve({
          href: "http://localhost:3000/api/tasks/44",
          id: "44",
          name: "ansible_stdout",
          state: "Finished",
          status: "Ok",
          message: "Task completed successfully",
          userid: "system",
          created_on: "2017-11-14T19:22:01Z",
          updated_on: "2017-11-14T19:22:06Z",
          miq_server_id: "1",
          task_results: "<!DOCTYPE HTML>\n<html>\n  <head>\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n    <title>Job Stdout</title>\n<style type=\"text/css\">\n.ansi_fore { color: #000000; }\n.ansi_back { background-color: #F5F5F5; }\n.ansi_fore.ansi_dark { color: #AAAAAA; }\n.ansi_back.ansi_dark { background-color: #000000; }\n.ansi1 { font-weight: bold; }\n.ansi3 { font-weight: italic; }\n.ansi4 { text-decoration: underline; }\n.ansi9 { text-decoration: line-through; }\n.ansi30 { color: #161b1f; }\n.ansi31 { color: #d9534f; }\n.ansi32 { color: #5cb85c; }\n.ansi33 { color: #f0ad4e; }\n.ansi34 { color: #337ab7; }\n.ansi35 { color: #e1539e; }\n.ansi36 { color: #2dbaba; }\n.ansi37 { color: #ffffff; }\n.ansi40 { background-color: #161b1f; }\n.ansi41 { background-color: #d9534f; }\n.ansi42 { background-color: #5cb85c; }\n.ansi43 { background-color: #f0ad4e; }\n.ansi44 { background-color: #337ab7; }\n.ansi45 { background-color: #e1539e; }\n.ansi46 { background-color: #2dbaba; }\n.ansi47 { background-color: #ffffff; }\nbody.ansi_back pre {\n  font-family: Monaco, Menlo, Consolas, \"Courier New\", monospace;\n  font-size: 12px;\n}\ndiv.ansi_back.ansi_dark {\n  padding: 0 8px;\n  -webkit-border-radius: 3px;\n  -moz-border-radius: 3px;\n  border-radius: 3px;\n}\n</style>\n  </head>\n  <body class=\"ansi_fore ansi_back ansi_dark\">\n    <pre>stdout capture is missing</pre>\n  </body>\n</html>",
        });
      });

      compile();
    }));

    it('sets the data', function(done) {
      setTimeout(function() {
        expect(scope.$ctrl).toBeDefined();
        expect(scope.$ctrl.error).toBeFalsy();
        expect(scope.$ctrl.loading).toBeFalsy();
        expect(scope.$ctrl.data).toBeDefined();
        expect(scope.$ctrl.sanitized).toBeDefined();
        done();
      });
    });
  });
});
