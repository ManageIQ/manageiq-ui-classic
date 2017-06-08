ManageIQ.angular.app.controller('pglogicalReplicationFormController', ['$http', '$scope', 'pglogicalReplicationFormId', 'miqService', function($http, $scope, pglogicalReplicationFormId, miqService) {
  var vm = this;

  var init = function() {
    vm.pglogicalReplicationModel = {
      replication_type: 'none',
      subscriptions: [],
      addEnabled: false,
      updateEnabled: false,
      exclusion_list: null,
    };
    vm.formId = pglogicalReplicationFormId;
    vm.afterGet = false;
    vm.modelCopy = angular.copy( vm.pglogicalReplicationModel );

    ManageIQ.angular.scope = vm;
    vm.model = 'pglogicalReplicationModel';
    vm.newRecord = false;

    miqService.sparkleOn();
    $http.get('/ops/pglogical_subscriptions_form_fields/' + pglogicalReplicationFormId)
      .then(getPgLogicalFormData)
      .catch(miqService.handleFailure);
  };

  var pglogicalManageSubscriptionsButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = '/ops/pglogical_save_subscriptions/' + pglogicalReplicationFormId + '?button=' + buttonName;
    miqService.miqAjaxButton(url, serializeFields);
  };

  vm.resetClicked = function() {
    vm.pglogicalReplicationModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  vm.saveClicked = function() {
    // remove existing subscriptions that have not changed before sending them up for save
    vm.pglogicalReplicationModel.subscriptions.forEach(function(subscription, index, object) {
      if (typeof subscription.id !== 'undefined' && subscription["remove"] !== true &&  !subscriptionChanged(subscription, vm.modelCopy.subscriptions[index])) {
        object.splice(index, 1);
      }
    });
    var updated_exclusion_list = "";
    if (vm.pglogicalReplicationModel.replication_type == "remote" && !angular.equals(vm.pglogicalReplicationModel.exclusion_list, vm.modelCopy.exclusion_list) ) {
      updated_exclusion_list = angular.copy(vm.pglogicalReplicationModel.exclusion_list);
    }
    pglogicalManageSubscriptionsButtonClicked('save', {
      'replication_type': vm.pglogicalReplicationModel.replication_type,
      'subscriptions' : vm.pglogicalReplicationModel.subscriptions,
      'exclusion_list' : updated_exclusion_list
    });
    $scope.angularForm.$setPristine(true);
  };

  // check if subscription values have been changed
  var subscriptionChanged = function(new_subscription, original_subscription) {
    if (new_subscription.dbname   === original_subscription.dbname &&
        new_subscription.host     === original_subscription.host &&
        new_subscription.user     === original_subscription.user &&
        new_subscription.password === original_subscription.password &&
        new_subscription.port     === original_subscription.port)
      return false;
    else
      return true;
  }

  // replication type changed, show appropriate flash message
  vm.replicationTypeChanged = function() {
    miqService.miqFlashClear();
    var original_value = vm.modelCopy.replication_type;
    var new_value      = vm.pglogicalReplicationModel.replication_type;
    if (original_value == "none" && new_value == "none")
      miqService.miqFlash("warn", __("No replication role has been set"));
    else if (original_value == "remote" && new_value == 'none')
      miqService.miqFlash("warn", __("Replication will be disabled for this region"));
    else if (original_value == "global" && new_value == 'none')
      miqService.miqFlash("warn", __("All current subscriptions will be removed"));
    else if (original_value == "global" && new_value == 'remote')
      miqService.miqFlash("warn", __("Changing to remote replication role will remove all current subscriptions"));

    if (new_value != "global") {
      vm.pglogicalReplicationModel.subscriptions = [];
    };

    if (new_value != "remote") {
      vm.pglogicalReplicationModel.exclusion_list = angular.copy(vm.modelCopy.exclusion_list);
    };

    if (new_value == "global" && original_value == "global") {
      vm.pglogicalReplicationModel.subscriptions = angular.copy(vm.modelCopy.subscriptions);
    };
  };

  // add new subscription button pressed
  vm.enableSubscriptionAdd = function() {
    vm.pglogicalReplicationModel.updateEnabled = false;
    vm.pglogicalReplicationModel.addEnabled    = true;
    vm.pglogicalReplicationModel.dbname        = 'vmdb_production';
    vm.pglogicalReplicationModel.host          = '';
    vm.pglogicalReplicationModel.user          = '';
    vm.pglogicalReplicationModel.password      = '';
    vm.pglogicalReplicationModel.port          = '5432';
  };

  // update existing subscription button pressed
  vm.enableSubscriptionUpdate = function(idx) {
    var subscription = vm.pglogicalReplicationModel.subscriptions[idx];
    if (subscription.newRecord === true) {
      vm.pglogicalReplicationModel.s_index       = idx;
      vm.pglogicalReplicationModel.updateEnabled = true;
      vm.pglogicalReplicationModel.dbname        = subscription.dbname;
      vm.pglogicalReplicationModel.host          = subscription.host;
      vm.pglogicalReplicationModel.user          = subscription.user;
      vm.pglogicalReplicationModel.password      = subscription.password;
      vm.pglogicalReplicationModel.port          = subscription.port;
    } else if (confirm("An updated subscription must point to the same database with which it was originally created. Failure to do so will result in undefined behavior. Do you want to continue?")) {
      vm.pglogicalReplicationModel.s_index       = idx;
      vm.pglogicalReplicationModel.updateEnabled = true;
      vm.pglogicalReplicationModel.dbname        = subscription.dbname;
      vm.pglogicalReplicationModel.host          = subscription.host;
      vm.pglogicalReplicationModel.user          = subscription.user;
      vm.pglogicalReplicationModel.password      = miqService.storedPasswordPlaceholder;
      vm.pglogicalReplicationModel.port          = subscription.port;
    }
  };

  // add new subscription
  vm.addSubscription = function(idx) {
    if (typeof idx == 'undefined') {
      vm.pglogicalReplicationModel.subscriptions.push({
        dbname: vm.pglogicalReplicationModel.dbname,
        host: vm.pglogicalReplicationModel.host,
        user: vm.pglogicalReplicationModel.user,
        password: vm.pglogicalReplicationModel.password,
        port: vm.pglogicalReplicationModel.port,
        newRecord: true
      });
    } else {
      var subscription      = vm.pglogicalReplicationModel.subscriptions[idx];
      subscription.dbname   = vm.pglogicalReplicationModel.dbname;
      subscription.host     = vm.pglogicalReplicationModel.host;
      subscription.user     = vm.pglogicalReplicationModel.user;
      subscription.port     = vm.pglogicalReplicationModel.port;
    }
    vm.pglogicalReplicationModel.addEnabled = false;
    vm.pglogicalReplicationModel.updateEnabled = false;
  };

  //delete an existing subscription
  vm.removeSubscription = function(idx) {
    var subscription = vm.pglogicalReplicationModel.subscriptions[idx];
    if (subscription.newRecord === true) {
      vm.pglogicalReplicationModel.subscriptions.splice(idx, 1);
      if (angular.equals(vm.pglogicalReplicationModel.subscriptions, vm.modelCopy.subscriptions))
        $scope.angularForm.$setPristine(true);
    } else if (confirm("Deleting a subscription will remove all replicated data which originated in the selected region. Do you want to continue?"))
      subscription.remove = true;
  };

  // discard new subscription add
  vm.discardSubscription = function(idx) {
    if (typeof idx == 'undefined') {
      vm.pglogicalReplicationModel.dbname     = '';
      vm.pglogicalReplicationModel.host       = '';
      vm.pglogicalReplicationModel.user       = '';
      vm.pglogicalReplicationModel.password   = '';
      vm.pglogicalReplicationModel.port       = '';
      vm.pglogicalReplicationModel.addEnabled = false;
    } else {
      var original_values = vm.modelCopy.subscriptions[idx];
      var subscription    = vm.pglogicalReplicationModel.subscriptions[idx];
      vm.pglogicalReplicationModel.updateEnabled = false;
      subscription.dbname   = original_values.dbname;
      subscription.host     = original_values.host;
      subscription.user     = original_values.user;
      subscription.password = original_values.password;
      subscription.port     = original_values.port;
    }
  };

  // validate subscription, all required fields should have data
  vm.subscriptionValid = function() {
    if (typeof vm.pglogicalReplicationModel.dbname   != 'undefined' && vm.pglogicalReplicationModel.dbname   !== '' &&
        typeof vm.pglogicalReplicationModel.host     != 'undefined' && vm.pglogicalReplicationModel.host     !== '' &&
        typeof vm.pglogicalReplicationModel.user     != 'undefined' && vm.pglogicalReplicationModel.user     !== '' &&
        typeof vm.pglogicalReplicationModel.password != 'undefined' && vm.pglogicalReplicationModel.password !== ''
      )
      return true;
    else
      return false;
  }

  vm.saveEnabled = function(form) {
    var saveable = false;
    if (vm.pglogicalReplicationModel.replication_type != "remote") {
       saveable = form.$dirty && form.$valid && !vm.pglogicalReplicationModel.addEnabled && !vm.pglogicalReplicationModel.updateEnabled;
      // also need to enable save button when an existing subscriptions was deleted
      var subscriptions_changed = angular.equals(vm.pglogicalReplicationModel.subscriptions, vm.modelCopy.subscriptions);

      if ((saveable || !subscriptions_changed) &&
        vm.pglogicalReplicationModel.replication_type === "global" &&
        vm.pglogicalReplicationModel.subscriptions.length >= 1) {
        return true;
      }
      else if (saveable &&
        vm.pglogicalReplicationModel.replication_type !== "global" &&
        vm.pglogicalReplicationModel.subscriptions.length == 0) {
        return true;
      }
      else {
        return false;
      }
    } else {
      saveable = form.$dirty && form.$valid;
      if (saveable && ((vm.modelCopy.replication_type !== "remote") || !angular.equals(vm.pglogicalReplicationModel.exclusion_list, vm.modelCopy.exclusion_list))) {
        return true;
      }
      else {
        return false
      }
    }
  }

  // method to set flag to disable certain buttons when add of subscription in progress
  vm.addInProgress = function() {
    if (vm.pglogicalReplicationModel.addEnabled === true)
      return true;
    else
      return false;
  }

  // validate new/existing subscription
  vm.validateSubscription = function(idx) {
    var data = {};
    if (typeof idx == 'undefined') {
      data["dbname"] = vm.pglogicalReplicationModel.dbname;
      data["host"]     = vm.pglogicalReplicationModel.host;
      data["user"] = vm.pglogicalReplicationModel.user;
      data["password"] = vm.pglogicalReplicationModel.password;
      data["port"]     = vm.pglogicalReplicationModel.port;
    } else {
      var subscription = vm.pglogicalReplicationModel.subscriptions[idx];
      data["dbname"] = subscription.dbname;
      data["host"]     = subscription.host;
      data["user"] = subscription.user;
      data["password"] = subscription.password;
      data["port"]     = subscription.port;
      data["id"] = subscription.id
    }
    miqService.sparkleOn();
    var url = '/ops/pglogical_validate_subscription'
    miqService.miqAjaxButton(url, data);
  };

  // cancel delete button should be displayed only if existing saved subscriptions were deleted
  vm.showCancelDelete = function(idx) {
    var subscription = vm.pglogicalReplicationModel.subscriptions[idx];
    // only show subscriptions in red if they were saved subscriptions and deleted in current edit session
    if (subscription.remove === true)
      return true;
    else
      return false;
  }

  // put back subscription that was deleted into new subscriptions array
  vm.cancelDelete = function(idx) {
    var subscription = vm.pglogicalReplicationModel.subscriptions[idx];
    delete subscription["remove"];
  }

  vm.showChanged = function(idx, fieldName) {
    var original_values = vm.modelCopy.subscriptions[idx];
    // if updating a record use form fields to compare
    if (vm.pglogicalReplicationModel.updateEnabled) {
      var subscription = {};
      subscription["dbname"]  = vm.pglogicalReplicationModel.dbname;
      subscription["host"]     = vm.pglogicalReplicationModel.host;
      subscription["user"]     = vm.pglogicalReplicationModel.user;
      subscription["password"] = vm.pglogicalReplicationModel.password;
      subscription["port"]     = vm.pglogicalReplicationModel.port;
    } else
      var subscription = vm.pglogicalReplicationModel.subscriptions[idx];

    if (typeof original_values != 'undefined' && original_values[fieldName] != subscription[fieldName])
      return true;
    else
      return false;
  }

  vm.subscriptionInValidMessage = function() {
    if (vm.pglogicalReplicationModel.replication_type == 'global' &&
      (vm.pglogicalReplicationModel.subscriptions.length === 0 ||
      (vm.pglogicalReplicationModel.subscriptions.length == 1 && vm.pglogicalReplicationModel.subscriptions[0].remove === true)))
      return true;
    else
      return false;
  };


  function getPgLogicalFormData(response) {
    var data = response.data;

    vm.pglogicalReplicationModel.replication_type = data.replication_type;
    vm.pglogicalReplicationModel.subscriptions = angular.copy(data.subscriptions);
    vm.pglogicalReplicationModel.exclusion_list = angular.copy(data.exclusion_list);

    if (vm.pglogicalReplicationModel.replication_type === 'none') {
      miqService.miqFlash('warn', __("No replication role has been set"));
    }

    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.pglogicalReplicationModel );
    miqService.sparkleOff();
  }

  init();
}]);
