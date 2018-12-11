ManageIQ.angular.app.component('aeResolveOptions', {
  bindings: {
    instanceName: '<',
    instanceOptions: '<',
    instanceNameChange: '&',
    objectMessage: '<',
    objectMessageChange: '&',
    objectRequest: '<',
    objectRequestChange: '&',
    targetClass: '<',
    targetClassOptions: '<',
    targetClassChange: '&',
    targetId: '<',
    targetIdOptions: '<',
    targetIdChange: '&',
    uiAttrs: '<',
  },
  controller: function() {

  },
  templateUrl: '/static/ae_resolve_options/ae-resolve-options.html.haml',
});
