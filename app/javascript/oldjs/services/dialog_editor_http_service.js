ManageIQ.angular.app.service('DialogEditorHttp', ['$http', 'API', function($http, API) {
  this.loadDialog = function(id) {
    return API.get('/api/service_dialogs/' + id + '?attributes=content,buttons,label');
  };

  this.saveDialog = function(id, action, data) {
    return API.post('/api/service_dialogs' + id, {
      action: action,
      resource: data,
    }, {
      skipErrors: [400],
    });
  };

  this.treeSelectorLoadData = function(fqname) {
    var url = '/tree/automate_entrypoint' + (fqname ? '?fqname=' + encodeURIComponent(fqname) : '');
    return $http.get(url).then(function(response) {
      return response.data;
    });
  };

  this.treeSelectorLazyLoadData = function(node) {
    return $http.get('/tree/automate_entrypoint?id=' + encodeURIComponent(node.key)).then(function(response) {
      return response.data;
    });
  };

  // Load categories data from API.
  this.loadCategories = function() {
    return API.get('/api/categories' +
                        '?expand=resources' +
                        '&attributes=id,name,description,single_value,children');
  };

  /** Function to load all available workflows when 'Embedded Workflow' is selected for dynamic field. */
  this.loadAvailableWorkflows = () => {
    const url = '/api/configuration_script_payloads/?expand=resources&attributes=configuration_script_source.name&collection_class=ManageIQ::Providers::Workflows::AutomationManager::Workflow';
    return API.get(url);
  };

  /** Function to load a workflow with the provided 'id' */
  this.loadWorkflow = (id) => {
    const url = `/api/configuration_script_payloads/${id}`;
    return API.get(url)
      .then((response) => ({ data: response, status: true }))
      .catch((error) => ({ data: error, status: false }));
  };
}]);
