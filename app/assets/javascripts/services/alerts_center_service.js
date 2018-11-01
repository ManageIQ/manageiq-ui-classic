angular.module('alertsCenter').service('alertsCenterService', ['API', '$q', '$timeout', '$document', '$uibModal', '$http', function(API, $q, $timeout, $document, $uibModal, $http) {
  var _this = this;
  var providersURL = '/api/providers';
  var tagsURL = '/api/tags';
  var alertsURL = '/api/alerts';
  var observerCallbacks = [];

  var notifyObservers = function() {
    angular.forEach(observerCallbacks, function(callback) {
      callback();
    });
  };

  _this.registerObserverCallback = function(callback) {
    observerCallbacks.push(callback);
  };

  _this.unregisterObserverCallback = function(callback) {
    var index = observerCallbacks.indexOf(callback);
    if (index > -1) {
      observerCallbacks.splice(index, 1);
    }
  };

  _this.refreshInterval = 1000 * 60 * 3;

  _this.objectTypes = [];

  _this.displayFilters = [];

  // Eventually this should be retrieved from smart tags
  _this.categories = ['Environment'];

  _this.severities = {
    info: {
      title: __('Information'),
      value: 1,
      severityIconClass: 'pficon pficon-info',
      severityClass: 'alert-info',
    },
    warning: {
      title: __('Warning'),
      value: 2,
      severityIconClass: 'pficon pficon-warning-triangle-o',
      severityClass: 'alert-warning',
    },
    error: {
      title: __('Error'),
      value: 3,
      severityIconClass: 'pficon pficon-error-circle-o',
      severityClass: 'alert-danger',
    },
  };

  function getSeverityTitles() {
    var titles = [];

    angular.forEach(_this.severities, function(severity) {
      titles.push(severity.title);
    });

    return titles;
  }

  _this.severityTitles = getSeverityTitles();

  _this.alertListFilterFields = [
    {
      id: 'severity',
      title: __('Severity'),
      placeholder: __('Filter by Severity'),
      filterType: 'select',
      filterValues: _this.severityTitles,
    },
    {
      id: 'host',
      title: __('Host Name'),
      placeholder: __('Filter by Host Name'),
      filterType: 'text',
    },
    {
      id: 'name',
      title: __('Provider Name'),
      placeholder: __('Filter by Provider Name'),
      filterType: 'text',
    },
    {
      id: 'objectType',
      title: __('Provider Type'),
      placeholder: __('Filter by Provider Type'),
      filterType: 'select',
      filterValues: _this.objectTypes,
    },
    {
      id: 'message',
      title: __('Message Text'),
      placeholder: __('Filter by Message Text'),
      filterType: 'text',
    },
    {
      id: 'assignee',
      title: __('Owner'),
      placeholder: __('Filter by Owner'),
      filterType: 'text',
    },
    {
      id: 'acknowledged',
      title: __('Acknowledged'),
      placeholder: __('Filter by Acknowledged'),
      filterType: 'select',
      filterValues: [__('Acknowledged'), __('Unacknowledged')],
    },
  ];

  _this.getFiltersFromLocation = function(searchString, fields) {
    var currentFilters = [];

    if (_.isString(searchString)) {
      var filterString = searchString.slice(1);
      var filters = filterString.split('&');
      _.forEach(filters, function(nextFilter) {
        var filter = nextFilter.split('=');
        var filterId = filter[0].replace(/\[\d*\]/, function(v) {
          v.slice(1, -1);
          return '';
        });

        // set parameter value (use 'true' if empty)
        var filterValue = filter[1] === undefined ? true : filter[1];
        filterValue = decodeURIComponent(filterValue);

        var filterField = _.find(fields, function(field) {
          return field.id === filterId;
        });
        if (filterField !== undefined) {
          currentFilters.push({
            id: filterField.id,
            value: filterValue,
            title: filterField.title,
          });
        }
      });
    }

    return currentFilters;
  };

  function filterStringCompare(value1, value2) {
    var match = false;

    if (_.isString(value1) && _.isString(value2)) {
      match = value1.toLowerCase().indexOf(value2.toLowerCase()) !== -1;
    }

    return match;
  }

  _this.matchesFilter = function(item, filter) {
    var found = false;

    if (filter.id === 'severity') {
      found = item.severityInfo.title === filter.value;
    } else if (filter.id === 'message') {
      found = filterStringCompare(item.message, filter.value);
    } else if (filter.id === 'host') {
      found = filterStringCompare(item.hostName, filter.value);
    } else if (filter.id === 'objectType') {
      found = item.objectType === filter.value;
    } else if (filter.id === 'name') {
      found = filterStringCompare(item.objectName, filter.value);
    } else if (filter.id === 'assignee') {
      found = item.assignee_name && item.assignee_name.localeCompare(filter.value);
    } else if (filter.id === 'acknowledged') {
      found = filter.value === __('Acknowledged') ? item.acknowledged : ! item.acknowledged;
    } else if (filter.id === 'severityCount') {
      if (filter.value === _this.severityTitles[0]) {
        found = item.info.length > 0;
      } else if (filter.value === _this.severityTitles[1]) {
        found = item.warning.length > 0;
      } else if (filter.value === _this.severityTitles[2]) {
        found = item.error.length > 0;
      }
    }

    return found;
  };

  _this.filterAlerts = function(alertsList, filters) {
    var filteredAlerts = [];

    angular.forEach(alertsList, function(nextAlert) {
      var doNotAdd = false;
      if (filters && filters.length > 0) {
        doNotAdd = _.find(filters, function(filter) {
          if (! _this.matchesFilter(nextAlert, filter)) {
            return true;
          }
        });
      }
      if (! doNotAdd) {
        filteredAlerts.push(nextAlert);
      }
    });

    return (filteredAlerts);
  };

  _this.compareAlerts = function(item1, item2, sortId, isAscending) {
    var compValue = 0;
    if (sortId === 'time') {
      compValue = item1.evaluated_on - item2.evaluated_on;
    } else if (sortId === 'severity') {
      compValue = item1.severityInfo.value - item2.severityInfo.value;
    } else if (sortId === 'host') {
      compValue = item1.hostName.localeCompare(item2.hostName);
    } else if (sortId === 'name') {
      compValue = item1.objectName.localeCompare(item2.objectName);
    } else if (sortId === 'objectType') {
      compValue = item1.objectType.localeCompare(item2.objectType);
    } else if (sortId === 'assignee') {
      compValue = item1.assignee_name.localeCompare(item2.assignee_name);
    } else if (sortId === 'acknowledged') {
      compValue = item1.acknowledged ? (item2.acknowledged ? 0 : -1) : (item2.acknowledged ? 1 : 0);
    }

    if (compValue === 0) {
      compValue = item1.severityInfo.value - item2.severityInfo.value;
      if (compValue === 0) {
        compValue = item1.evaluated_on - item2.evaluated_on;
      }
    }

    if (! isAscending) {
      compValue = compValue * -1;
    }

    return compValue;
  };

  _this.alertListSortFields = [
    {
      id: 'time',
      title: __('Time'),
      sortType: 'numeric',
    },
    {
      id: 'severity',
      title: __('Severity'),
      sortType: 'numeric',
    },
    {
      id: 'host',
      title: __('Host Name'),
      sortType: 'alpha',
    },
    {
      id: 'name',
      title: __('Provider Name'),
      sortType: 'alpha',
    },
    {
      id: 'objectType',
      title: __('Provider Type'),
      sortType: 'alpha',
    },
    {
      id: 'assignee',
      title: __('Owner'),
      sortType: 'alpha',
    },
    {
      id: 'acknowledged',
      title: __('Acknowledged'),
      sortType: 'numeric',
    },
  ];

  _this.menuActions = [
    {
      id: 'acknowledge',
      name: __('Acknowledge'),
      isVisible: true,
      actionFn: handleMenuAction,
    },
    {
      id: 'addcomment',
      name: __('Add Note'),
      isVisible: true,
      actionFn: handleMenuAction,
    },
    {
      id: 'assign',
      name: __('Assign'),
      isVisible: true,
      actionFn: handleMenuAction,
    },
    {
      id: 'unacknowledge',
      name: __('Unacknowledge'),
      isVisible: true,
      actionFn: handleMenuAction,
    },
    {
      id: 'unassign',
      name: __('Unassign'),
      isVisible: true,
      actionFn: handleMenuAction,
    },
  ];

  _this.updateMenuActionForItemFn = function(action, item) {
    if (action.id === 'unassign') {
      action.isVisible = item.assigned;
    } else if (action.id === 'acknowledge') {
      action.isVisible = (item.assignee_id === _this.currentUser.id) && item.acknowledged !== true;
    } else if (action.id === 'unacknowledge') {
      action.isVisible = (item.assignee_id === _this.currentUser.id) && item.acknowledged === true;
    } else {
      action.isVisbile = true;
    }
  };

  _this.getUserByIdOrUserId = function(id) {
    var foundUser;
    for (var i = 0; i < _this.existingUsers.length && ! foundUser; i++) {
      if (_this.existingUsers[i].id === id || _this.existingUsers[i].userid === id) {
        foundUser = _this.existingUsers[i];
      }
    }

    return foundUser;
  };

  _this.getCurrentUser = function() {
    var deferred = $q.defer();

    // Get the current user
    API.get('/api').then(function(response) {
      _this.currentUser = response.identity;
      deferred.resolve();
    });

    return deferred.promise;
  };

  _this.updateExistingUsers = function() {
    var deferred = $q.defer();

    // Get the existing users
    API.get('/api/users?expand=resources').then(function(response) {
      // update the existing users list and current user
      _this.existingUsers = response.resources;
      _this.existingUsers.sort(function(user1, user2) {
        return user1.name.localeCompare(user2.name);
      });
      _this.currentUser = _this.getUserByIdOrUserId(_this.currentUser.userid);

      deferred.resolve();
    });

    return deferred.promise;
  };

  _this.updateProviders = function() {
    var deferred = $q.defer();

    API.get(providersURL + '?expand=resources&attributes=tags').then(function(response) {
      _this.providers = response.resources;
      deferred.resolve();
    });

    return deferred.promise;
  };

  _this.updateTags = function() {
    var deferred = $q.defer();

    API.get(tagsURL + '?expand=resources&attributes=category,categorization').then(function(response) {
      _this.tags = response.resources;
      deferred.resolve();
    });

    return deferred.promise;
  };

  _this.updateAlertsData = function(limit, offset, filters, sortField, sortAscending) {
    // Update data then get the alerts data
    return _this.getCurrentUser()
      .then(_this.updateExistingUsers)
      .then(_this.updateProviders)
      .then(_this.updateTags)
      .then(_this.updateIcons)
      .then(function() {
        return _this.getAlertsData(limit, offset, filters, sortField, sortAscending);
      });
  };

  _this.updateIcons = function() {
    return $http.get('/alerts_list/class_icons')
      .then(function(response) {
        _this.icons = response.data;
        return response;
      });
  };

  _this.getAlertsData = function(limit, offset, filters, sortField, sortAscending) {
    var deferred = $q.defer();
    var resourceOptions = '?expand=resources,alert_actions&attributes=assignee,resource&filter[]=resolved=false&filter[]=or+resolved=nil';
    var limitOptions = '';
    var offsetOptions = '';
    var sortOptions = '';

    if (sortField) {
      sortOptions = '&sort_by=' + sortField + '&sort_order=' + (sortAscending ? 'asc' : 'desc');
    }

    if (limit) {
      limitOptions = '&limit=' + limit;
    }

    if (offset) {
      offsetOptions = '&offset=' + offset;
    }

    // Get the alert data
    API.get(alertsURL + resourceOptions + limitOptions + offsetOptions + sortOptions).then(function(response) {
      deferred.resolve(response);
    });

    return deferred.promise;
  };

  function getObjectType(item) {
    var objectType = item.type;
    var descriptors = item.type.split('::');

    if (descriptors.length >= 3) {
      objectType = descriptors[2];
    }

    return objectType;
  }

  function convertApiTime(apiTimestamp) {
    var apiDate = new Date(apiTimestamp);
    return apiDate.getTime();
  }

  function updateAlertStatus(updateAlert) {
    if (updateAlert && updateAlert.alert_actions && updateAlert.alert_actions.length > 0) {
      var actionUser;
      var i;

      for (i = 0; i < updateAlert.alert_actions.length; i++) {
        updateAlert.alert_actions[i].created_at = convertApiTime(updateAlert.alert_actions[i].created_at);
        updateAlert.alert_actions[i].updated_at = convertApiTime(updateAlert.alert_actions[i].updated_at);
      }

      // Sort from newest to oldest
      updateAlert.alert_actions.sort(function(state1, state2) {
        return state2.updated_at - state1.updated_at;
      });

      // Set the lastUpdate to the time of the newest state change
      updateAlert.lastUpdate = updateAlert.alert_actions[0].updated_at;

      // update each state
      updateAlert.numComments = 0;
      for (i = 0; i < updateAlert.alert_actions.length; i++) {
        actionUser = _this.getUserByIdOrUserId(updateAlert.alert_actions[i].user_id);
        updateAlert.alert_actions[i].username = actionUser !== undefined ? actionUser.name : '';

        // Bump the comments count if a comment was made
        if (updateAlert.alert_actions[i].comment) {
          updateAlert.numComments++;
        }
      }

      if (updateAlert.numComments === 1) {
        updateAlert.commentsTooltip = sprintf(__('%d Note'), 1);
      } else {
        updateAlert.commentsTooltip = sprintf(__('%d Notes'), updateAlert.numComments);
      }
    }
  }

  function convertAlert(alertData, objectName, objectClassifiedType, objectType, retrievalTime) {
    var hostType = alertData.resource.type;
    var newAlert = {
      id: alertData.id,
      description: alertData.description,
      assignee: alertData.assignee,
      acknowledged: alertData.acknowledged !== undefined ? alertData.acknowledged : false,
      hostName: alertData.resource.name,
      hostType: hostType,
      hostImg: _this.icons[hostType],
      hostLink: '/container_node/show/' + alertData.resource.id,
      objectName: objectName,
      objectType: objectType,
      objectTypeImg: _this.icons[objectClassifiedType],
      objectLink: '/restful_redirect/index?model=ExtManagementSystem&id=' + alertData.ems_id,
      sopLink: alertData.url,
      evaluated_on: convertApiTime(alertData.evaluated_on),
      severity: alertData.severity,
      alert_actions: alertData.alert_actions,
    };

    if (newAlert.severity === 'error') {
      newAlert.severityInfo = _this.severities.error;
    } else if (newAlert.severity === 'warning') {
      newAlert.severityInfo = _this.severities.warning;
    } else {
      newAlert.severityInfo = _this.severities.info;
    }

    newAlert.age = moment.duration(retrievalTime - newAlert.evaluated_on).format('dd[d] hh[h] mm[m] ss[s]');
    newAlert.rowClass = 'alert ' + newAlert.severityInfo.severityClass;
    newAlert.lastUpdate = newAlert.evaluated_on;
    newAlert.numComments = 0;

    if (alertData.assignee !== undefined) {
      newAlert.assigned = true;
      newAlert.assignee_name = alertData.assignee.name;
      newAlert.assignee_id = alertData.assignee.id;
    } else {
      newAlert.assigned = false;
      newAlert.assignee_name = __('Unassigned');
    }

    updateAlertStatus(newAlert);
    return newAlert;
  }

  _this.convertToAlertsList = function(response) {
    var alertData = response;
    var alerts = [];
    _this.objectTypes.splice(0, _this.objectTypes.length);
    var newTypes = [];
    var retrievalTime = (new Date()).getTime();
    var alertProvider;
    var objectType;
    var objectName;
    var objectClassifiedType;

    angular.forEach(alertData.resources, function(item) {
      alertProvider = _.find(_this.providers, function(provider) {
        return provider.id === item.ems_id;
      });

      if (alertProvider !== undefined) {
        objectType = getObjectType(alertProvider);
        objectName = alertProvider.name;
        objectClassifiedType = alertProvider.type;
      }

      // Add filter for this object type
      if (newTypes.indexOf(objectType) === -1) {
        newTypes.push(objectType);
      }
      if (item.resource) {
        alerts.push(convertAlert(item, objectName, objectClassifiedType, objectType, retrievalTime));
      }
    });

    newTypes.sort();
    angular.forEach(newTypes, function(type) {
      _this.objectTypes.push(type);
    });

    return alerts;
  };

  _this.convertToAlertsOverview = function(responseData) {
    var alertData = [];

    _this.objectTypes.splice(0, _this.objectTypes.length);

    // Add each alert in the appropriate group
    angular.forEach(responseData.resources, function(item) {
      var objectType;
      var foundType;
      var descriptors;
      var summaryItem;
      var matchingTag;
      var foundTag;

      // Set the provider object for the alert (we only support provider alerts at this time)
      summaryItem = _.find(alertData, function(nextSummaryItem) {
        return nextSummaryItem.id === item.ems_id;
      });

      if (! summaryItem) {
        angular.forEach(_this.providers, function(provider) {
          if (provider.id === item.ems_id) {
            summaryItem = {
              id: provider.id,
              name: provider.name,
              objectName: provider.name,
              displayType: 'providers',
              tags: [],
              error: [],
              warning: [],
              info: [],
            };

            providerType = getObjectType(provider);
            descriptors = provider.type.toLowerCase().split('::');
            if (descriptors.length >= 3) {
              summaryItem.displayType = descriptors[1];
              objectType = descriptors[2];
            }

            summaryItem.objectType = objectType.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
            summaryItem.objectTypeImg = _this.icons[provider.type];

            foundType = _.find(_this.objectTypes, function(nextType) {
              return nextType === summaryItem.objectType;
            });

            if (! foundType) {
              _this.objectTypes.push(summaryItem.objectType);
            }

            // Determine the tag values for this object
            if (provider.tags) {
              angular.forEach(provider.tags, function(providerTag) {
                matchingTag = _.find(_this.tags, function(nextTag) {
                  return nextTag.id === providerTag.id;
                });
                if (matchingTag !== undefined  && matchingTag.categorization.category !== undefined  ) {
                  summaryItem.tags.push({
                    id: providerTag.id,
                    categoryName: matchingTag.categorization.category.name,
                    categoryTitle: matchingTag.categorization.category.description,
                    value: matchingTag.categorization.name,
                    title: matchingTag.categorization.description,
                  });
                }
              });

              // Determine the categories for this object
              angular.forEach(_this.categories, function(nextCategory) {
                foundTag = _.find(summaryItem.tags, function(nextTag) {
                  return nextTag.categoryTitle === nextCategory;
                });
                if (foundTag !== undefined) {
                  summaryItem[nextCategory] = foundTag.title;
                }
              });
            }

            alertData.push(summaryItem);
          }
        });
      }

      if (summaryItem) {
        if (_this.displayFilters.indexOf(summaryItem.displayType) === -1) {
          _this.displayFilters.push(summaryItem.displayType);
        }

        if (! item.severity) {
          item.severity = 'info';
        }
        summaryItem[item.severity].push(item);
      }
    });

    return alertData;
  };

  function processState(response) {
    var newState;

    if (response.results && response.results.length > 0) {
      newState = response.results[0];

      if (_this.editItem.alert_actions === undefined) {
        _this.editItem.alert_actions = [];
      }
      _this.editItem.alert_actions.push(newState);
      if (newState.action_type === 'assign') {
        _this.editItem.assigned = true;
        _this.editItem.assignee_id = newState.assignee_id;
        _this.editItem.assignee_name = _this.getUserByIdOrUserId(newState.assignee_id).name;
      } else if (newState.action_type === 'unassign') {
        _this.editItem.assigned = false;
        _this.editItem.assignee_id = undefined;
        _this.editItem.assignee_name = __('Unassigned');
        _this.editItem.acknowledged = false;
      } else if (newState.action_type === 'acknowledge') {
        _this.editItem.acknowledged = true;
      } else if (newState.action_type === 'unacknowledge') {
        _this.editItem.acknowledged = false;
      }

      updateAlertStatus(_this.editItem);

      notifyObservers();

      if (_this.doAfterStateChange !== undefined) {
        _this.newComment = '';
        _this.doAfterStateChange();
        _this.doAfterStateChange = undefined;
      }
    }
  }

  function doAddState(action) {
    var state = {
      action_type: action,
      comment: _this.newComment,
      user_id: _this.currentUser.id,
    };
    if (action === 'assign') {
      state.assignee_id = _this.owner.id;
    }

    var stateURL = alertsURL + '/' + _this.editItem.id + '/alert_actions';
    API.post(stateURL, state).then(processState);
  }

  function doAcknowledge() {
    doAddState('acknowledge');
  }

  function doUnacknowledge() {
    doAddState('unacknowledge');
  }

  function doAssign() {
    if (_this.editItem.assignee_id !== _this.owner.id) {
      if (_this.owner) {
        if (_this.currentAcknowledged !== _this.editItem.acknowledged) {
          _this.doAfterStateChange = _this.currentAcknowledged ? doAcknowledge : doUnacknowledge;
        }

        doAddState('assign');
      } else {
        doUnassign();
      }
    }
  }

  function doUnassign() {
    doAddState('unassign');
  }

  function doAddComment() {
    if (_this.newComment) {
      doAddState('comment');
    }
  }

  var modalOptions = {
    animation: true,
    backdrop: 'static',
    templateUrl: '/static/edit_alert_dialog.html',
    controller: 'EditAlertDialogController as vm',
    resolve: {
      editData: function() {
        return _this;
      },
    },
  };

  function showEditDialog(item, title, showAssign, doneCallback, querySelector) {
    _this.editItem = item;
    _this.editTitle = title;
    _this.showAssign = showAssign;
    _this.owner = undefined;
    _this.currentAcknowledged = _this.editItem.acknowledged;
    for (var i = 0; i < _this.existingUsers.length; i++) {
      if (item.assigned && _this.existingUsers[i].id === item.assignee_id) {
        _this.owner = _this.existingUsers[i];
      }
    }
    _this.newComment = '';
    var modalInstance = $uibModal.open(modalOptions);
    modalInstance.result.then(doneCallback);

    $timeout(function() {
      var queryResult = $document[0].querySelector(querySelector);
      if (queryResult) {
        queryResult.focus();
      }
    }, 200);
  }

  function handleMenuAction(action, item) {
    switch (action.id) {
      case 'acknowledge':
        showEditDialog(item, __('Acknowledge Alert'), false, doAcknowledge, '#edit-alert-ok');
        break;
      case 'unacknowledge':
        showEditDialog(item, __('Uncknowledge Alert'), false, doUnacknowledge, '#edit-alert-ok');
        break;
      case 'assign':
        showEditDialog(item, __('Assign Alert'), true, doAssign, '[data-id="assign-select"]');
        break;
      case 'unassign':
        showEditDialog(item, __('Unassign Alert'), false, doUnassign, '#edit-alert-ok-button');
        break;
      case 'addcomment':
        showEditDialog(item, __('Add Note'), false, doAddComment, '#comment-text-area');
        break;
    }
  }
}]);
