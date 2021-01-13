ManageIQ.angular.app.directive('miqForm', function() {
  return {
    require: 'form',
    link: function(scope, elem, attr, ctrl) {
      ctrl.model = attr.model;
      ctrl.modelCopy = attr.modelCopy;
    },
  };
});
