export function DialogEditorHttpService($http, API) {
  this.loadDialog = function(id) {
    return API.get(`/api/service_dialogs/${id}?attributes=content,buttons,label`);
  };

  this.saveDialog = function(id, action, data) {
    return API.post(`/api/service_dialogs/${id}`, {
      action,
      resource: data,
    }, {
      skipErrors: [400],
    });
  };

  this.treeSelectorLoadData = function(fqname) {
    const param = fqname ? `?fqname=${encodeURIComponent(fqname)}` : '';
    const url = `/tree/automate_entrypoint${param}`;
    return $http.get(url).then((response) => response.data);
  };

  this.treeSelectorLazyLoadData = function(node) {
    return $http.get(`/tree/automate_entrypoint?id=${encodeURIComponent(node.key)}`).then((response) => response.data);
  };

  // Load categories data from API.
  this.loadCategories = function() {
    return API.get('/api/categories?expand=resources&attributes=id,name,description,single_value,children');
  };
}

DialogEditorHttpService.$inject = ['$http', 'API'];
