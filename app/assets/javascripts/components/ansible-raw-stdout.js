ManageIQ.angular.app.component('ansibleRawStdout', {
  bindings: {
    taskId: '@',
  },
  controller: ['$sce', 'API', function($sce, API) {
    var vm = this;

    vm.loading = true;
    vm.error = null;
    vm.data = null;

    vm.$onInit = function() {
      if (!vm.taskId) {
        vm.loading = false;
        return;
      }

      API.wait_for_task(vm.taskId)
        .then(function(data) {
          vm.data = data;
          vm.sanitized = $sce.trustAsHtml(data.task_results);
        })
        .catch(function(error) {
          vm.error = error;
          console.error(error);
        })
        .then(function() {
          vm.loading = false;

          // clean up after we're done
          API.delete('/api/tasks/' + vm.taskId);
        });
    };
  }],
  templateUrl: '/static/ansible-raw-stdout.html.haml',
});
