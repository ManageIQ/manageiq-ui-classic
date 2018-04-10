(function() {
  var EmsKeypairController = function($scope, ng_show, validate_url, prefix, main_scope, verify_title_off, userid_disabled, private_key_disabled, userid_label, private_key_label, new_private_key_label, change_stored_private_key, cancel_private_key_change) {
    var vm = this;
    vm.ng_show = ng_show;
    vm.validate_url = validate_url;
    vm.prefix = prefix;
    vm.main_scope = main_scope;
    vm.verify_title_off = verify_title_off;
    vm.userid_disabled = userid_disabled;
    vm.private_key_disabled = private_key_disabled;
    vm.userid_label = userid_label;
    vm.private_key_label = private_key_label;
    vm.new_private_key_label = new_private_key_label;
    vm.change_stored_private_key = change_stored_private_key;
    vm.cancel_private_key_change = cancel_private_key_change;
    $scope.$on('resetClicked', function() {
      vm.resetClicked();
    });

    $scope.$on('setNewRecord', function(_event, args) {
      if (args != undefined) {
        vm.newRecord = args.newRecord;
      } else {
        vm.newRecord = true;
      }
    });

    $scope.$on('setUserId', function(_event, args) {
      if(args != undefined) {
        $scope.modelCopy[args.userIdName] = args.userIdValue;
      }
    });
  };

  EmsKeypairController.prototype.initialize = function(model, formId) {
    var vm = this;
    vm.model = model;
    vm.modelCopy = angular.copy(model);
    vm.formId = formId;
    vm.changeKey = undefined;

    if (vm.formId == 'new') {
      vm.newRecord = true;
    } else {
      vm.newRecord = false;
      vm.changeKey = false;
    }
  };

  EmsKeypairController.prototype.changeStoredPrivateKey = function() {
    this.changeKey = true;
    this.model.ssh_keypair_password = '';
  };

  EmsKeypairController.prototype.cancelPrivateKeyChange = function() {
    if (this.changeKey) {
      this.changeKey = false;
      this.model.ssh_keypair_password = '●●●●●●●●';
    }
  };

  EmsKeypairController.prototype.inEditMode = function(userid) {
    return (this.newRecord
            || !this.showChangePrivateKeyLinks(userid)
            || this.changeKey);
  };

  EmsKeypairController.prototype.showChangePrivateKeyLinks = function(userid) {
    return !this.newRecord && this.modelCopy[userid] != '';
  };

  EmsKeypairController.prototype.resetClicked = function() {
    this.newRecord = false;
    this.cancelPrivateKeyChange();
  };

  EmsKeypairController.prototype.showValidate = function(tab) {
    return !(this.model.emstype == 'openstack_infra' && this.newRecord && tab == 'ssh_keypair')
  };

  EmsKeypairController.$inject = ["$scope", "ng_show", "validate_url", "prefix", "main_scope", "verify_title_off", "userid_disabled", "private_key_disabled", "userid_label", "private_key_label", "new_private_key_label", "change_stored_private_key", "cancel_private_key_change"];
  ManageIQ.angular.app.controller('emsKeypairController', EmsKeypairController);
})();
