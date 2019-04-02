angular.module('alertsCenter')
  .controller('EditAlertDialogController', ['editData',
    function(editData) {
      var vm = this;
      vm.editData = editData;
    },
  ]);
